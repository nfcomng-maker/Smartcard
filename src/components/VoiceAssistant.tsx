import { useState, useRef, useEffect } from "react";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Mic, MicOff, X, Volume2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [modelResponse, setModelResponse] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const toggleAssistant = () => {
    if (isOpen) {
      stopSession();
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful AI assistant for SMARTCARD, an NFC business card platform. You can help users manage their profile, understand analytics, or explain how NFC works. Keep responses concise and friendly.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startMicrophone();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn) {
              const part = message.serverContent.modelTurn.parts[0];
              if (part?.inlineData?.data) {
                const base64Data = part.inlineData.data;
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const pcmData = new Int16Array(bytes.buffer);
                audioQueueRef.current.push(pcmData);
                if (!isPlayingRef.current) {
                  playNextInQueue();
                }
              }
            }

            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
            }

            if (message.serverContent?.turnComplete) {
              // Turn complete
            }
          },
          onclose: () => {
            stopSession();
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            stopSession();
          },
        },
      });

      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to connect to Gemini Live:", error);
      setIsConnecting(false);
    }
  };

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }

        // Convert to Base64
        const buffer = pcmData.buffer;
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);

        if (sessionRef.current) {
          sessionRef.current.sendRealtimeInput({
            media: { data: base64Data, mimeType: "audio/pcm;rate=16000" },
          });
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsListening(true);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const playNextInQueue = async () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const pcmData = audioQueueRef.current.shift()!;
    
    const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 0x7FFF;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      playNextInQueue();
    };
    source.start();
  };

  const stopSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsConnected(false);
    setIsListening(false);
    setIsConnecting(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-80 glass p-6 rounded-[2.5rem] shadow-2xl border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                  <Volume2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Voice Assistant</h3>
                  <p className="text-[10px] text-light/40 uppercase tracking-widest">Powered by Gemini</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-light/20 hover:text-light transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="h-32 flex flex-col items-center justify-center text-center space-y-4">
                {!isConnected && !isConnecting && (
                  <>
                    <p className="text-xs text-light/60">Ready to help with your SMARTCARD dashboard.</p>
                    <button 
                      onClick={startSession}
                      className="btn-primary px-6 py-2 rounded-xl text-xs font-bold"
                    >
                      Start Conversation
                    </button>
                  </>
                )}
                {isConnecting && (
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 size={32} className="text-gold animate-spin" />
                    <p className="text-xs text-light/40">Connecting to AI...</p>
                  </div>
                )}
                {isConnected && (
                  <div className="flex flex-col items-center space-y-4 w-full">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: isListening ? [8, 24, 8] : 8,
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.5,
                            delay: i * 0.1,
                          }}
                          className="w-1 bg-gold rounded-full"
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium text-gold">I'm listening...</p>
                  </div>
                )}
              </div>

              {isConnected && (
                <button 
                  onClick={stopSession}
                  className="w-full py-3 rounded-2xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all"
                >
                  End Session
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleAssistant}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all relative",
          isOpen ? "bg-dark text-gold border border-gold/20" : "bg-gold text-dark"
        )}
      >
        {isOpen ? <MicOff size={24} /> : <Mic size={24} />}
        {isConnected && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A0A0A] animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
