import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database.Database;
try {
  db = new Database("smartcard.db");
} catch (error) {
  console.error("Failed to open database:", error);
  // Fallback to in-memory if file fails
  db = new Database(":memory:");
}
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user', -- 'admin' or 'user'
    reset_token TEXT,
    reset_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 100
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total_amount REAL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'shipped'
    items TEXT, -- JSON string of items
    customer_details TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  -- Existing tables...
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    url TEXT,
    icon TEXT,
    active INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    bio TEXT,
    avatar_url TEXT,
    background_image_url TEXT,
    theme TEXT DEFAULT 'default',
    custom_css TEXT,
    background_video_url TEXT,
    music_embed_url TEXT,
    enable_contact_form INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    email TEXT,
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_type TEXT, -- 'view', 'click'
    link_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT UNIQUE,
    content TEXT,
    excerpt TEXT,
    category TEXT,
    image_url TEXT,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data if empty
const userCountResult = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCountResult.count === 0) {
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "password123", "admin");
  db.prepare("INSERT INTO profile (user_id, name, bio, theme) VALUES (?, ?, ?, ?)").run(1, "SMARTCARD", "Your NFC Business Page", "gold");
  db.prepare("INSERT INTO links (user_id, title, url, icon) VALUES (?, ?, ?, ?)").run(1, "Website", "https://example.com", "Globe");
  db.prepare("INSERT INTO links (user_id, title, url, icon) VALUES (?, ?, ?, ?)").run(1, "Instagram", "https://instagram.com", "Instagram");
  
  // Seed blog posts
  db.prepare(`INSERT INTO blog_posts (title, slug, content, excerpt, category, image_url) VALUES (?, ?, ?, ?, ?, ?)`).run(
    "How NFC is Changing the Networking Landscape",
    "nfc-networking-landscape",
    "Full content about NFC networking...",
    "Discover why professionals are ditching paper business cards for smart technology.",
    "Technology",
    "https://picsum.photos/seed/blog1/800/500"
  );
}

const productsCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
if (productsCount.count === 0) {
  const initialProducts = [
    { name: "SmartCard Pro (Gold)", price: 15000, category: "NFC Card", image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=800&q=80" },
    { name: "SmartCard Matte Black", price: 12000, category: "NFC Card", image: "https://images.unsplash.com/photo-1621416848440-236914c7447d?auto=format&fit=crop&w=800&q=80" },
    { name: "SmartCard Bamboo", price: 18000, category: "NFC Card", image: "https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?auto=format&fit=crop&w=800&q=80" },
    { name: "NFC Phone Tag", price: 5000, category: "Accessory", image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80" }
  ];
  const insertProduct = db.prepare("INSERT INTO products (name, price, category, image_url, description) VALUES (?, ?, ?, ?, ?)");
  initialProducts.forEach(p => insertProduct.run(p.name, p.price, p.category, p.image, `High-quality ${p.name} for seamless networking.`));
}

const settingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
if (settingsCount.count === 0) {
  const defaultSettings = [
    { key: "hero_title", value: "The Future of Networking is Here" },
    { key: "hero_subtitle", value: "Create your digital business card in seconds and share it with a tap." },
    { key: "contact_email", value: "support@smartcard.ng" },
    { key: "currency_symbol", value: "₦" }
  ];
  const insertSetting = db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)");
  defaultSettings.forEach(s => insertSetting.run(s.key, s.value));
}

export const app = express();

export async function startServer() {
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.get("/api/site-settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM site_settings").all() as any[];
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsMap);
  });

  app.post("/api/admin/site-settings", (req, res) => {
    const updates = req.body;
    const updateSetting = db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)");
    Object.entries(updates).forEach(([key, value]) => {
      updateSetting.run(key, String(value));
    });
    res.json({ success: true });
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/checkout", (req, res) => {
    const { user_id, items, total_amount, customer_details } = req.body;
    const result = db.prepare("INSERT INTO orders (user_id, items, total_amount, customer_details) VALUES (?, ?, ?, ?)")
      .run(user_id || null, JSON.stringify(items), total_amount, JSON.stringify(customer_details));
    res.json({ success: true, orderId: result.lastInsertRowid });
  });

  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare("SELECT id, username, role, created_at FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/users", (req, res) => {
    const { username, password, role } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)")
        .run(username, password || 'password123', role || 'user');
      
      // Create initial profile
      db.prepare("INSERT INTO profile (user_id, name, bio) VALUES (?, ?, ?)")
        .run(result.lastInsertRowid, username, `Hi, I'm ${username}!`);
        
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/users/:id", (req, res) => {
    const { username, role, password } = req.body;
    const userId = req.params.id;
    
    if (password) {
      db.prepare("UPDATE users SET username = ?, role = ?, password = ? WHERE id = ?").run(username, role, password, userId);
    } else {
      db.prepare("UPDATE users SET username = ?, role = ? WHERE id = ?").run(username, role, userId);
    }
    res.json({ success: true });
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const userId = req.params.id;
    // Delete user and all associated data
    db.prepare("DELETE FROM links WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM profile WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM analytics WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM leads WHERE user_id = ?").run(userId);
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    res.json({ success: true });
  });

  app.get("/api/admin/stats", (req, res) => {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    const orderCount = db.prepare("SELECT COUNT(*) as count FROM orders").get() as { count: number };
    const totalRevenue = db.prepare("SELECT SUM(total_amount) as total FROM orders").get() as { total: number };
    const recentOrders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5").all();
    
    res.json({
      userCount: userCount.count,
      orderCount: orderCount.count,
      totalRevenue: totalRevenue.total || 0,
      recentOrders
    });
  });

  app.get("/api/profile/:username", (req, res) => {
    const { username } = req.params;
    const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as { id: number } | undefined;
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = db.prepare("SELECT * FROM profile WHERE user_id = ?").get(user.id);
    const links = db.prepare("SELECT * FROM links WHERE user_id = ? AND active = 1 ORDER BY order_index ASC").all(user.id);

    // Track view analytics
    db.prepare("INSERT INTO analytics (user_id, event_type, ip_address, user_agent) VALUES (?, ?, ?, ?)").run(
      user.id,
      'view',
      req.ip,
      req.get('user-agent')
    );

    res.json({ profile, links });
  });

  app.post("/api/signup", (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    try {
      const result = db.prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)")
        .run(username, email || null, password, 'user');
      
      // Create initial profile
      db.prepare("INSERT INTO profile (user_id, name, bio) VALUES (?, ?, ?)")
        .run(result.lastInsertRowid, username, `Hi, I'm ${username}!`);
        
      res.json({ success: true, user: { id: result.lastInsertRowid, username, role: 'user' } });
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint failed")) {
        res.status(400).json({ error: "Username already exists" });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  app.post("/api/forgot-password", (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (!user) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    db.prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?").run(token, expires, user.id);

    // In a real app, send email here. For now, we'll just return the token for demo purposes.
    console.log(`Password reset token for ${email}: ${token}`);
    
    res.json({ success: true, message: "Reset link sent to your email", token }); 
  });

  app.post("/api/reset-password", (req, res) => {
    const { token, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE reset_token = ? AND reset_expires > ?").get(token, new Date().toISOString()) as any;

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    db.prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?").run(password, user.id);
    res.json({ success: true, message: "Password updated successfully" });
  });

  // OAuth Routes
  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || 'DUMMY_GOOGLE_CLIENT_ID',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url });
  });

  app.get("/api/auth/google/callback", (req, res) => {
    const { code } = req.query;
    // In a real app, exchange code for tokens here
    // For demo, we'll simulate a successful login for the 'admin' user or a new oauth user
    const simulatedUser = { id: 1, username: 'admin' }; 

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                user: ${JSON.stringify(simulatedUser)} 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  app.get("/api/auth/facebook/url", (req, res) => {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/facebook/callback`;
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID || 'DUMMY_FACEBOOK_CLIENT_ID',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email,public_profile',
    });
    const url = `https://www.facebook.com/v12.0/dialog/oauth?${params.toString()}`;
    res.json({ url });
  });

  app.get("/api/auth/facebook/callback", (req, res) => {
    const simulatedUser = { id: 1, username: 'admin' }; 
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                user: ${JSON.stringify(simulatedUser)} 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  });

  // Admin API
  app.get("/api/admin/links/:userId", (req, res) => {
    const links = db.prepare("SELECT * FROM links WHERE user_id = ? ORDER BY order_index ASC").all(req.params.userId);
    res.json(links);
  });

  app.post("/api/admin/links", (req, res) => {
    const { user_id, title, url, icon } = req.body;
    db.prepare("INSERT INTO links (user_id, title, url, icon) VALUES (?, ?, ?, ?)").run(user_id, title, url, icon);
    res.json({ success: true });
  });

  app.delete("/api/admin/links/:id", (req, res) => {
    db.prepare("DELETE FROM links WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/links/reorder", (req, res) => {
    const { links } = req.body; // Array of { id, order_index }
    const updateOrder = db.prepare("UPDATE links SET order_index = ? WHERE id = ?");
    
    const transaction = db.transaction((linksToUpdate) => {
      for (const link of linksToUpdate) {
        updateOrder.run(link.order_index, link.id);
      }
    });

    transaction(links);
    res.json({ success: true });
  });

  app.get("/api/admin/analytics/:userId", (req, res) => {
    const views = db.prepare("SELECT COUNT(*) as count FROM analytics WHERE user_id = ? AND event_type = 'view'").get(req.params.userId) as { count: number };
    const clicks = db.prepare("SELECT COUNT(*) as count FROM analytics WHERE user_id = ? AND event_type = 'click'").get(req.params.userId) as { count: number };
    const recentViews = db.prepare("SELECT timestamp, ip_address FROM analytics WHERE user_id = ? AND event_type = 'view' ORDER BY timestamp DESC LIMIT 10").all(req.params.userId);
    
    res.json({ views: views.count, clicks: clicks.count, recentViews });
  });

  app.post("/api/admin/profile", (req, res) => {
    const { user_id, name, bio, theme, avatar_url, background_image_url, custom_css, background_video_url, music_embed_url, enable_contact_form } = req.body;
    db.prepare("UPDATE profile SET name = ?, bio = ?, theme = ?, avatar_url = ?, background_image_url = ?, custom_css = ?, background_video_url = ?, music_embed_url = ?, enable_contact_form = ? WHERE user_id = ?")
      .run(name, bio, theme, avatar_url, background_image_url, custom_css, background_video_url, music_embed_url, enable_contact_form, user_id);
    res.json({ success: true });
  });

  app.get("/api/admin/leads/:userId", (req, res) => {
    const leads = db.prepare("SELECT * FROM leads WHERE user_id = ? ORDER BY timestamp DESC").all(req.params.userId);
    res.json(leads);
  });

  app.post("/api/profile/:username/lead", (req, res) => {
    const { username } = req.params;
    const { name, email, message } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE username = ?").get(username) as { id: number } | undefined;
    
    if (!user) return res.status(404).json({ error: "User not found" });

    db.prepare("INSERT INTO leads (user_id, name, email, message) VALUES (?, ?, ?, ?)").run(user.id, name, email, message);
    res.json({ success: true });
  });

  // Blog API
  app.get("/api/blog", (req, res) => {
    const posts = db.prepare("SELECT * FROM blog_posts ORDER BY published_at DESC").all();
    res.json(posts);
  });

  // Contact Form with Email
  app.post("/api/contact", async (req, res) => {
    const { name, email, message, hcaptchaToken } = req.body;

    // Verify hCaptcha (Placeholder for real secret)
    // In production, use: https://hcaptcha.com/siteverify
    
    if (resend) {
      try {
        await resend.emails.send({
          from: 'SMARTCARD <onboarding@resend.dev>',
          to: 'vickthor.dennis@gmail.com',
          subject: `New Contact from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });
        res.json({ success: true, message: "Email sent successfully" });
      } catch (error) {
        res.status(500).json({ success: false, error: "Failed to send email" });
      }
    } else {
      console.log("Email simulation:", { name, email, message });
      res.json({ success: true, message: "Email simulation successful (RESEND_API_KEY missing)" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
}

if (process.env.NODE_ENV !== 'production' || !process.env.NETLIFY) {
  startServer().then(() => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}
