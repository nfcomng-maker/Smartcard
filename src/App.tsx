import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { Blog } from "./pages/Blog";
import { Contact } from "./pages/Contact";
import { UserPage } from "./pages/UserPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Login } from "./pages/Login";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Shop } from "./pages/Shop";
import { CartProvider } from "./context/CartContext";

import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";

export default function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <Router>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Public Landing Pages */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Home />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/privacy"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Privacy />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/terms"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Terms />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/about"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <About />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/services"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Services />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/blog"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Blog />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/contact"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Contact />
                  </main>
                  <Footer />
                </>
              }
            />
            <Route
              path="/shop"
              element={
                <>
                  <Navbar />
                  <main className="flex-grow">
                    <Shop />
                  </main>
                  <Footer />
                </>
              }
            />

            {/* User Linktree Pages */}
            <Route path="/u/:username" element={<UserPage />} />

            {/* Admin Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
      </CartProvider>
    </HelmetProvider>
  );
}

