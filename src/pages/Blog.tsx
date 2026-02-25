import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="pt-32 text-center">Loading...</div>;

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6">Our Blog</h1>
          <p className="text-xl text-light/60 max-w-2xl mx-auto">
            Insights, guides, and news from the world of smart networking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl mb-6 aspect-[16/9]">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="py-1 px-3 bg-gold text-dark text-xs font-bold rounded-full uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs text-light/40 font-bold uppercase tracking-widest">
                  {new Date(post.published_at).toLocaleDateString()}
                </p>
                <h2 className="text-2xl font-bold group-hover:text-gold transition-colors">
                  {post.title}
                </h2>
                <p className="text-light/60 leading-relaxed">
                  {post.excerpt}
                </p>
                <button className="text-gold font-bold text-sm flex items-center space-x-2">
                  <span>Read More</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-32 glass p-12 rounded-[3rem] text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Subscribe to our Newsletter</h2>
          <p className="text-light/60 mb-8">Get the latest updates and networking tips delivered to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-grow bg-white/5 border border-white/10 rounded-full py-4 px-6 outline-none focus:border-gold"
              required
            />
            <button type="submit" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </div>
    </div>
  );
}
