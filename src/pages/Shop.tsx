import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, CheckCircle, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Product } from "../types";
import { cn } from "../lib/utils";

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { items, addToCart, removeFromCart, clearCart, total } = useCart();
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", address: "" });
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        total_amount: total,
        customer_details: customerInfo
      })
    });
    if (res.ok) {
      setOrderSuccess(true);
      clearCart();
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-dark pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">NFC Shop</h1>
            <p className="text-light/40">Premium NFC products for the modern professional.</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-4 glass rounded-2xl hover:scale-105 transition-transform"
          >
            <ShoppingCart className="text-gold" />
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-gold text-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl overflow-hidden group"
            >
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-dark/80 backdrop-blur-md text-[10px] font-bold text-gold rounded-full uppercase tracking-widest">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                <p className="text-sm text-light/40 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gold">₦{product.price.toLocaleString()}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="p-3 bg-gold text-dark rounded-xl hover:scale-110 transition-transform"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-dark border-l border-white/5 z-[101] p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-20 text-light/20">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-10" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 glass rounded-2xl">
                      <img src={item.image_url} className="w-16 h-16 rounded-xl object-cover" alt="" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-xs text-gold">₦{item.price.toLocaleString()}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <button className="p-1 hover:text-gold"><Minus size={14} /></button>
                          <span className="text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="p-1 hover:text-gold"><Plus size={14} /></button>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-light/20 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-gold">₦{total.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full btn-primary py-4 flex items-center justify-center space-x-2"
                  >
                    <CreditCard size={18} />
                    <span>Checkout Now</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass p-8 rounded-[2.5rem] shadow-2xl"
            >
              {orderSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Order Placed!</h3>
                  <p className="text-light/40">Thank you for your purchase. We'll contact you soon.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-6">Complete Order</h3>
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-light/40 mb-2 ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-light/40 mb-2 ml-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-light/40 mb-2 ml-1">Delivery Address</label>
                      <textarea
                        required
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-gold h-24"
                      />
                    </div>
                    <div className="pt-4">
                      <div className="flex justify-between mb-4 text-sm font-bold">
                        <span className="text-light/40 uppercase tracking-widest">Total to Pay</span>
                        <span className="text-gold">₦{total.toLocaleString()}</span>
                      </div>
                      <button type="submit" className="w-full btn-primary py-4">
                        Confirm & Pay
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
