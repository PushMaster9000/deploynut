import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, ArrowRight, Upload, Zap, Camera, Brain, UtensilsCrossed } from 'lucide-react';
import CameraUpload from '../components/CameraUpload';

export default function LandingPage() {
  const navigate = useNavigate();
  const [trialResult, setTrialResult] = useState(null);
  const hasUsedTrial = localStorage.getItem('free_trial_used');

  const handleTrialScan = async (data) => {
    localStorage.setItem('free_trial_used', 'true');
    setTrialResult(data);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-brand-green selection:text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-brand-green p-2 rounded-lg">
            <ChefHat size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">NutriVision</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold hover:text-brand-green transition">Log in</Link>
          <Link to="/signup" className="bg-brand-green hover:bg-brand-green-hover px-5 py-2.5 rounded-full text-sm font-bold transition shadow-lg shadow-brand-green/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-card border border-dark-border text-brand-green text-xs font-bold uppercase tracking-wider">
            <Zap size={12} /> AI-Powered Food Intelligence
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
            Turn Food Images into <span className="text-brand-green">Smart Nutrition</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl">
            Snap a photo of any meal and instantly get recipe predictions, calorie counts, and personalized health recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => document.getElementById('try-free').scrollIntoView({ behavior: 'smooth' })}
              className="bg-brand-green hover:bg-brand-green-hover px-8 py-4 rounded-full font-bold text-lg transition flex items-center justify-center gap-2"
            >
              Try Free Scan <ArrowRight size={20} />
            </button>
            <Link to="/signup" className="px-8 py-4 rounded-full font-bold text-lg border border-dark-border hover:bg-dark-card transition flex items-center justify-center">
              Create Account
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative">
           <div className="absolute -inset-4 bg-brand-green/20 blur-3xl rounded-full opacity-50" />
           <img 
             src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=1000" 
             alt="Healthy Bowl" 
             className="relative rounded-3xl shadow-2xl border border-dark-border"
           />
           <div className="absolute top-8 right-[-20px] bg-dark-card p-4 rounded-2xl border border-dark-border shadow-xl flex items-center gap-4 animate-bounce hidden md:flex">
             <div className="bg-brand-green/20 p-2 rounded-lg text-brand-green">
               <Zap size={24} />
             </div>
             <div>
               <p className="text-sm font-bold">98% Match</p>
               <p className="text-xs text-gray-400">Grilled Salmon</p>
             </div>
           </div>
        </div>
      </div>

      {/* --- NEW CONTEXT SECTION: HOW IT WORKS --- */}
      <div className="bg-dark-card py-16 border-y border-dark-border relative overflow-hidden">
         {/* Background decorative blob */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-green/5 blur-3xl rounded-full pointer-events-none" />
         
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold mb-4">How NutriVision Works</h2>
               <p className="text-gray-400 max-w-2xl mx-auto">From plate to data in seconds. Our advanced computer vision model analyzes your food to provide actionable insights.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {/* Step 1 */}
               <div className="bg-dark-bg p-8 rounded-3xl border border-dark-border text-center group hover:border-brand-green/50 transition-all">
                  <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                     <Camera size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">1. Snap or Upload</h3>
                  <p className="text-gray-400">Take a photo of your meal or upload an existing image. We support common formats like JPG and PNG.</p>
               </div>

               {/* Step 2 */}
               <div className="bg-dark-bg p-8 rounded-3xl border border-dark-border text-center group hover:border-brand-green/50 transition-all relative">
                  {/* Connector Line for desktop */}
                  <div className="hidden md:block absolute top-1/2 -left-4 w-8 border-t-2 border-dashed border-dark-border" />
                  
                  <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                     <Brain size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">2. AI Analysis</h3>
                  <p className="text-gray-400">Our model identifies ingredients, estimates portion sizes, and calculates nutritional values instantly.</p>
               </div>

               {/* Step 3 */}
               <div className="bg-dark-bg p-8 rounded-3xl border border-dark-border text-center group hover:border-brand-green/50 transition-all relative">
                   {/* Connector Line for desktop */}
                  <div className="hidden md:block absolute top-1/2 -left-4 w-8 border-t-2 border-dashed border-dark-border" />

                  <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                     <UtensilsCrossed size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">3. Get Insights</h3>
                  <p className="text-gray-400">Receive calorie counts, macro breakdowns, and personalized recipe suggestions based on what you have.</p>
               </div>
            </div>
         </div>
      </div>
      {/* ----------------------------------------- */}


      {/* Free Trial Section */}
      <div id="try-free" className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Try it now — no account needed</h2>
          <p className="text-gray-400 mb-12">Upload one food image for free and see NutriVision AI in action.</p>

          {hasUsedTrial && !trialResult ? (
             <div className="bg-dark-card p-12 rounded-3xl border border-dark-border animate-fade-in">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Free Trial Limit Reached</h3>
                <p className="text-gray-400 mb-6">You've used your free scan. Create an account to unlock unlimited access.</p>
                <Link to="/signup" className="bg-brand-green hover:bg-brand-green-hover text-white px-8 py-3 rounded-xl font-bold transition inline-block">
                  Create Free Account
                </Link>
             </div>
          ) : trialResult ? (
             <div className="bg-dark-card p-8 rounded-3xl border border-dark-border text-left animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-2xl font-bold text-brand-green">Analysis Complete!</h3>
                   <Link to="/signup" className="text-sm underline text-gray-400 hover:text-white">Save Results</Link>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="bg-dark-bg p-6 rounded-2xl border border-dark-border">
                      <p className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-2">Detected Food</p>
                      <p className="text-3xl font-bold capitalize">{trialResult.detected_food}</p>
                      <div className="flex gap-2 mt-4">
                         <span className="px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-xs font-bold">
                           {Math.round(trialResult.confidence * 100)}% Confidence
                         </span>
                      </div>
                   </div>
                   
                   <div className="flex flex-col justify-center items-center bg-brand-green/10 rounded-2xl p-6 border border-brand-green/20">
                      <p className="font-bold text-lg mb-2">Unlock Full Nutrition Info</p>
                      <p className="text-sm text-center text-gray-400 mb-4">Sign up to see calories, macros, and get recipe recommendations.</p>
                      <Link to="/signup" className="bg-brand-green hover:bg-brand-green-hover px-6 py-2 rounded-lg font-bold w-full text-center transition">
                        Unlock Now
                      </Link>
                   </div>
                </div>
             </div>
          ) : (
             <div className="bg-dark-card p-4 rounded-3xl border border-dark-border shadow-2xl">
                <CameraUpload 
                  appliances={[]} 
                  constraints={[]} 
                  onResult={handleTrialScan} 
                />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}