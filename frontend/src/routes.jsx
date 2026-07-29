import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
// import Dashboard from './pages/Dashboard';
// import CSAgent from './pages/CSAgent';
// import Orders from './pages/Orders';
// import Products from './pages/Products';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Placeholder pages until implemented in Phase 1B */}
        <Route path="/" element={<div className="text-2xl font-bold">대시보드 (구현 예정)</div>} />
        <Route path="/cs" element={<div className="text-2xl font-bold">AI 고객 지원 (구현 예정)</div>} />
        <Route path="/orders" element={<div className="text-2xl font-bold">주문 관리 (구현 예정)</div>} />
        <Route path="/products" element={<div className="text-2xl font-bold">상품/재고 (구현 예정)</div>} />
        <Route path="/reviews" element={<div className="text-2xl font-bold">리뷰 지능 (구현 예정)</div>} />
        <Route path="/crm" element={<div className="text-2xl font-bold">고객 CRM (구현 예정)</div>} />
        <Route path="/analytics" element={<div className="text-2xl font-bold">매출 분석 (구현 예정)</div>} />
        <Route path="/copilot" element={<div className="text-2xl font-bold">AI 코파일럿 (구현 예정)</div>} />
        <Route path="/settings" element={<div className="text-2xl font-bold">설정 (구현 예정)</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
