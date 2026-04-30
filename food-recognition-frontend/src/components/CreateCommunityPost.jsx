import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';

export default function CreateCommunityPost() {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [calories, setCalories] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  
  // Image states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // UI states
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a local URL to show a preview instantly
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      showToast("Please select an image first!", "error");
      return;
    }

    setIsUploading(true);

    try {
      // STEP 1: Upload Image to FastApi -> Cloudinary
      const formData = new FormData();
      formData.append('file', imageFile);

      // Important: Content-Type is multipart/form-data for files
      const uploadRes = await apiClient.post('/api/community/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const cloudinaryUrl = uploadRes.data.url;

      // STEP 2: Save the Recipe to MongoDB
      const recipeData = {
        title,
        time,
        calories,
        // Convert comma-separated strings into arrays
        ingredients: ingredients.split(',').map(item => item.trim()),
        instructions: instructions.split('.').map(item => item.trim()).filter(i => i),
        image_url: cloudinaryUrl
      };

      await apiClient.post('/api/community/create-post', recipeData);

      showToast("Recipe published to Community!");
      
      // Clear the form
      setTitle(''); setTime(''); setCalories('');
      setIngredients(''); setInstructions('');
      setImageFile(null); setImagePreview(null);

    } catch (error) {
      console.error(error);
      showToast("Failed to post recipe. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-200 dark:border-dark-border shadow-sm mt-8 animate-fade-in relative">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Share a Recipe</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* IMAGE UPLOAD SECTION */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center relative overflow-hidden group hover:border-brand-green transition-colors">
          {imagePreview ? (
            <div className="relative w-full h-64 rounded-xl overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-4 right-4 p-2 bg-gray-900/50 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mb-4">
                <ImageIcon size={32} />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Click to upload food photo</p>
              <p className="text-sm text-gray-500">JPG, PNG or WEBP (Max 5MB)</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
            </div>
          )}
        </div>

        {/* RECIPE DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Recipe Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Grandma's Chicken Curry" className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-brand-green text-gray-900 dark:text-white" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Time</label>
              <input type="text" value={time} onChange={(e) => setTime(e.target.value)} required placeholder="e.g. 45 mins" className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-brand-green text-gray-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Calories</label>
              <input type="text" value={calories} onChange={(e) => setCalories(e.target.value)} required placeholder="e.g. 350 kcal" className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-brand-green text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Ingredients (Comma separated)</label>
          <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} required placeholder="2 cups rice, 1 tsp salt, 500g chicken..." rows="3" className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-brand-green text-gray-900 dark:text-white resize-none" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Instructions (Period separated)</label>
          <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} required placeholder="Chop the vegetables. Fry the chicken. Serve hot." rows="4" className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-brand-green text-gray-900 dark:text-white resize-none" />
        </div>

        <button 
          type="submit" 
          disabled={isUploading}
          className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
          {isUploading ? 'Uploading to Community...' : 'Publish Recipe'}
        </button>
      </form>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="absolute top-4 right-4 z-[110] animate-fade-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-brand-green'}`}>
            <CheckCircle2 size={20} /> {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}