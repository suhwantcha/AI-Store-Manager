import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/AdminDashboard';
import CSAgentHub from './pages/CSAgentHub';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Reviews from './pages/Reviews';
import CRM from './pages/CRM';
import Analytics from './pages/Analytics';
import AIManager from './pages/AIManager';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/cs" element={<CSAgentHub />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/manager" element={<AIManager />} />
        <Route path="/settings" element={<div className="p-8 text-2xl font-bold">설정 (구현 예정)</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
