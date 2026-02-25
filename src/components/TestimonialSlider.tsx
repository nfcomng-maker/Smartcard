import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Olumide Adebayo",
    role: "CEO @ TechLagos",
    content: "SMARTCARD has revolutionized how we network in the tech space. One tap and my details are shared instantly. It's the future of professional networking in Nigeria.",
    image: "https://picsum.photos/seed/olu/100/100",
  },
  {
    id: 2,
    name: "Chidi Okafor",
    role: "Real Estate Consultant",
    content: "I no longer carry bulky business cards. My clients are always impressed when I tap my card on their phones. It's a conversation starter and a deal closer.",
    image: "https://picsum.photos/seed/chidi/100/100",
  },
  {
    id: 3,
    name: "Amina Yusuf",
    role: "Creative Director",
    content: "The digital landing page is beautiful and so easy to customize. It's the perfect extension of my brand. I've seen a 40% increase in my social media following since I started using it.",
    image: "https://picsum.photos/seed/amina/100/100",
  },
  {
    id: 4,
    name: "Funke Akindele",
    role: "Event Planner",
    content: "Networking at events is now a breeze. I can track how many people visited my profile after a tap. The analytics are a game changer for my business strategy.",
    image: "https://picsum.photos/seed/funke/100/100",
  },
  {
    id: 5,
    name: "Emeka Nwosu",
    role: "Software Engineer",
    content: "The integration is seamless. I love the analytics dashboard; it helps me see who's interested in my work. It's the most professional way to share my GitHub and Portfolio.",
    image: "https://picsum.photos/seed/emeka/100/100",
  },
];

export function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-20 overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
        <p className="text-light/60">Join thousands of professionals in Nigeria using SMARTCARD.</p>
      </div>

      <div className="relative h-[400px] md:h-[300px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full"
          >
            <div className="glass p-8 md:p-12 rounded-[2.5rem] border-white/5 relative">
              <Quote className="absolute top-6 right-8 text-gold/10 w-16 h-16 -z-10" />
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-20 h-20 rounded-full border-2 border-gold/20 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="text-center md:text-left">
                  <p className="text-lg md:text-xl italic text-light/80 mb-6 leading-relaxed">
                    "{testimonials[currentIndex].content}"
                  </p>
                  <div>
                    <h4 className="font-bold text-lg">{testimonials[currentIndex].name}</h4>
                    <p className="text-gold text-sm font-medium uppercase tracking-wider">
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-6 mt-8">
        <button
          onClick={() => paginate(-1)}
          className="p-3 rounded-full border border-white/10 hover:bg-gold hover:text-dark transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? "bg-gold w-6" : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => paginate(1)}
          className="p-3 rounded-full border border-white/10 hover:bg-gold hover:text-dark transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
