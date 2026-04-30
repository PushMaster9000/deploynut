import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import GenerateRecipes from './pages/GenerateRecipes';
import Signup from './pages/Signup';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ScanPage from './pages/ScanPage';
import MyRecipes from './pages/MyRecipes';
import ScanHistory from './pages/ScanHistory';
import Profile from './pages/Profile';
import CommunityHub from './pages/CommunityHub';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/dashboard" element={<DashboardLayout />}>
             <Route index element={<DashboardHome />} />
             <Route path="scan" element={<ScanPage />} />
             {/* NEW ROUTE */}
             <Route path="generate-recipes" element={<GenerateRecipes />} />
             <Route path="recipes" element={<MyRecipes />} />
             <Route path="/dashboard/my-recipes" element={<MyRecipes />} />
             <Route path="/dashboard/community" element={<CommunityHub />} />
             <Route path="history" element={<ScanHistory />} />
             <Route path="profile" element={<Profile />} />
          </Route>
          </Routes>
          </BrowserRouter>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}