import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import axios from 'axios';

// Replace this with your actual Hugging Face or Local URL
const API_BASE_URL = "http://localhost:8000"; 

export default function CameraUpload({ appliances, constraints, onResult }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    setLoading(true);

    // 1. Convert Image to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;

      try {
        // 2. Send to FastAPI Backend
        const response = await axios.post(`${API_BASE_URL}/api/v1/predict`, {
          image_base64: base64Image,
          health_constraints: constraints || [],
          available_appliances: appliances || []
        });

        // 3. Send real result back to ScanPage
        onResult(response.data);
      } catch (error) {
        console.error("Prediction Error:", error);
        alert(error.response?.data?.detail || "Failed to connect to the AI server.");
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      alert("Error reading file");
      setLoading(false);
    };
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[350px]
        ${isDragging 
          ? 'border-brand-green bg-brand-green/5' 
          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#0B0F19]'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileInput} 
        accept="image/jpeg, image/png, image/webp"
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
          <Loader2 size={48} className="text-brand-green animate-spin" />
          <p className="text-gray-900 dark:text-white font-bold text-lg">Analyzing food...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Identifying ingredients and calculating macros</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center animate-fade-in">
          <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-6 shadow-sm">
            <Camera size={32} />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Drop your food photo here
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            or click to browse - JPG, PNG, WEBP supported
          </p>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 border border-transparent dark:border-gray-700"
          >
            <Upload size={18} /> Choose File
          </button>
        </div>
      )}
    </div>
  );
}