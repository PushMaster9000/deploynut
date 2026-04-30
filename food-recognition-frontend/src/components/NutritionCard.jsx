import React from 'react';
import { Activity, Droplets, Scale } from 'lucide-react';

export default function NutritionCard({ foodInfo, confidence, detectedFood }) {
  if (!foodInfo) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
      {/* Header with Confidence Score */}
      <div className="bg-brand-green p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-green-100 text-xs uppercase tracking-widest font-bold">Detected Item</p>
            <h2 className="text-3xl font-black capitalize">{detectedFood}</h2>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 text-center">
            <p className="text-xs font-bold leading-none">{Math.round(confidence * 100)}%</p>
            <p className="text-[10px] uppercase opacity-80">Match</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-brand-orange mb-1">
              <Activity size={16} />
              <span className="text-xs font-bold uppercase">Calories</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{foodInfo.calories_per_100g} <span className="text-sm font-normal text-slate-500">kcal</span></p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Droplets size={16} />
              <span className="text-xs font-bold uppercase">Sugar</span>
            </div>
            <p className="text-xl font-bold text-slate-800 capitalize">{foodInfo.sugar_level}</p>
          </div>
        </div>

        {/* Health Tags */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nutritional Profile</h4>
          <div className="flex flex-wrap gap-2">
            {foodInfo.health_tags.map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-green-50 text-brand-green border border-green-100 rounded-full text-xs font-medium capitalize"
              >
                {tag.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Info Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center gap-3 text-slate-400">
          <Scale size={18} />
          <p className="text-xs leading-tight">
            Nutritional values are calculated per 100g serving size.
          </p>
        </div>
      </div>
    </div>
  );
}