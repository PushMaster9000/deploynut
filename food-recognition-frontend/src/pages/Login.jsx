import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, Mail, Lock, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser(); 
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Stop browser from reloading the page
    setError('');
    
    console.log("Login button clicked! Sending data:", formData);

    if (!formData.email || !formData.password) {
        setError('Please fill in both your email and password.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      console.log("Login successful! Navigating to dashboard...");
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed:", err.message);
      setError(err.message); 
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark-bg">
      {/* Left Image Side */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80" 
          alt="Food" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-4">Your AI-powered nutrition companion awaits.</h2>
          <p className="text-lg text-gray-300">Log in to access your personalized dashboard, scan history, and smart recipes.</p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-dark-bg text-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Welcome back</h2>
            <p className="text-gray-400 mt-2">Enter your credentials to access your account.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-500 text-sm font-medium animate-fade-in flex gap-2 items-center">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
                {/* CHANGED TO type="text" SO THE BROWSER DOESNT BLOCK CLICKS */}
                <input 
                    type="text" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition"
                    placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input 
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition"
                    placeholder="••••••••"
                />
              </div>
            </div>

            <button disabled={loading} className="w-full bg-brand-green hover:bg-brand-green-hover disabled:bg-gray-600 text-white font-bold py-3 rounded-xl transition">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400">
            Don't have an account? <Link to="/signup" className="text-brand-green font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}