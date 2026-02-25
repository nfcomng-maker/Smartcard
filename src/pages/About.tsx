import { motion } from "framer-motion";

export function About() {
  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl text-light/60 max-w-3xl mx-auto">
            We're on a mission to bridge the gap between physical networking and digital presence. SMARTCARD makes it effortless to share your world with a single tap.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <img
            src="https://picsum.photos/seed/about1/800/600"
            alt="Team"
            className="rounded-3xl shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Built for the Modern Professional</h2>
            <p className="text-light/60 leading-relaxed">
              In an increasingly digital world, your first impression matters more than ever. SMARTCARD was born out of the need for a more sustainable, efficient, and dynamic way to exchange information.
            </p>
            <p className="text-light/60 leading-relaxed">
              We believe that networking should be seamless, data-driven, and beautiful. Our platform provides you with the tools to express your professional identity exactly how you want.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div>
                <p className="text-4xl font-bold text-gold mb-2">10k+</p>
                <p className="text-sm text-light/40 uppercase tracking-widest">Active Users</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-gold mb-2">50+</p>
                <p className="text-sm text-light/40 uppercase tracking-widest">Countries</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-12">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass p-6 rounded-2xl">
                <img
                  src={`https://picsum.photos/seed/team${i}/300/300`}
                  alt="Team member"
                  className="w-full aspect-square rounded-xl mb-6 object-cover"
                  referrerPolicy="no-referrer"
                />
                <h3 className="font-bold text-lg">Team Member {i}</h3>
                <p className="text-gold text-sm mb-4">Co-Founder</p>
                <p className="text-xs text-light/40">Passionate about tech and networking.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
