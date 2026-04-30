import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, User, Mail, Lock, ArrowRight, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, verifyEmail } = useUser();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields first.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const success = await signup(formData.name, formData.email, formData.password);
      if (success) {
        setIsVerifying(true);
        setError('');
      }
      setLoading(false);
    } catch (err) {
      console.error("Signup failed:", err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(formData.email, verificationCode);
      console.log("Verification successful! Navigating to dashboard");
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0 };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 8 && /[A-Z]/.test(password)) score += 1;
    if (password.length >= 8 && /[0-9]/.test(password)) score += 1;
    if (password.length >= 8 && /[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length > 0 && password.length < 8) return { score: 1, label: 'Too Short', bg: 'bg-red-500', text: 'text-red-500', width: 'w-1/4' };

    switch (score) {
      case 1: return { score: 1, label: 'Weak', bg: 'bg-red-500', text: 'text-red-500', width: 'w-1/4' };
      case 2: return { score: 2, label: 'Fair', bg: 'bg-orange-500', text: 'text-orange-500', width: 'w-1/2' };
      case 3: return { score: 3, label: 'Good', bg: 'bg-yellow-500', text: 'text-yellow-500', width: 'w-3/4' };
      case 4: return { score: 4, label: 'Strong', bg: 'bg-brand-green', text: 'text-brand-green', width: 'w-full' };
      default: return { score: 1, label: 'Weak', bg: 'bg-red-500', text: 'text-red-500', width: 'w-1/4' };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <div className="min-h-screen flex bg-dark-bg">
      {/* Left Image Side */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80"
          alt="Cooking"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/40" />
        <div className="absolute bottom-12 left-12 text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-4">Join the NutriVision Community.</h2>
          <p className="text-lg text-gray-300">Start your journey towards smarter eating and healthier living today.</p>
        </div>
        <div
          className="absolute top-8 left-8 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <ChefHat className="text-brand-green" />
          <span className="text-white font-bold text-xl">NutriVision</span>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-dark-bg text-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold">{isVerifying ? "Verify Your Email" : "Create Account"}</h2>
            <p className="text-gray-400 mt-2">
              {isVerifying ? `We've sent a 6-digit code to ${formData.email}.` : "It's free and takes less than a minute."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-500 text-sm font-medium animate-fade-in flex gap-2 items-center">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {!isVerifying ? (
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-500" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-12 py-3 text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300 transition"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-3 space-y-1.5 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Password strength:</span>
                      <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-border rounded-full overflow-hidden">
                      <div className={`h-full ${strength.bg} transition-all duration-300 ${strength.width}`}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full bg-dark-card border rounded-xl pl-12 pr-12 py-3 text-white focus:ring-1 outline-none transition
                      ${passwordsMismatch
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : passwordsMatch
                          ? 'border-brand-green focus:border-brand-green focus:ring-brand-green'
                          : 'border-dark-border focus:border-brand-green focus:ring-brand-green'
                      }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300 transition"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Match feedback */}
                {formData.confirmPassword && (
                  <p className={`mt-1.5 text-xs font-medium animate-fade-in ${passwordsMatch ? 'text-brand-green' : 'text-red-500'}`}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                disabled={loading}
                className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'} {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 text-gray-500" size={20} />
                  <input
                    type="text"
                    maxLength="6"
                    value={verificationCode}
                    onChange={(e) => { setVerificationCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                    className="w-full bg-dark-card border border-dark-border rounded-xl pl-12 pr-4 py-3 text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition tracking-[0.5em] text-xl"
                    placeholder="123456"
                  />
                </div>
              </div>
              <button
                disabled={loading}
                className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? 'Verifying...' : 'Verify Account'} {!loading && <ArrowRight size={20} />}
              </button>
            </form>
          )}

          {!isVerifying && (
            <p className="text-center text-gray-400">
              Already have an account? <Link to="/login" className="text-brand-green font-bold hover:underline">Sign In</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}