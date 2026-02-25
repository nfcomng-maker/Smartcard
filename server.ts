import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("smartcard.db");
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

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
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", "password123");
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
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

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
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

  app.get("/api/admin/analytics/:userId", (req, res) => {
    const views = db.prepare("SELECT COUNT(*) as count FROM analytics WHERE user_id = ? AND event_type = 'view'").get(req.params.userId) as { count: number };
    const clicks = db.prepare("SELECT COUNT(*) as count FROM analytics WHERE user_id = ? AND event_type = 'click'").get(req.params.userId) as { count: number };
    const recentViews = db.prepare("SELECT timestamp, ip_address FROM analytics WHERE user_id = ? AND event_type = 'view' ORDER BY timestamp DESC LIMIT 10").all(req.params.userId);
    
    res.json({ views: views.count, clicks: clicks.count, recentViews });
  });

  app.post("/api/admin/profile", (req, res) => {
    const { user_id, name, bio, theme, avatar_url, background_video_url, music_embed_url, enable_contact_form } = req.body;
    db.prepare("UPDATE profile SET name = ?, bio = ?, theme = ?, avatar_url = ?, background_video_url = ?, music_embed_url = ?, enable_contact_form = ? WHERE user_id = ?")
      .run(name, bio, theme, avatar_url, background_video_url, music_embed_url, enable_contact_form, user_id);
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
