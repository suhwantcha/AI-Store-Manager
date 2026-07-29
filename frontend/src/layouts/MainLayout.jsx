import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar } from '@mui/material';
import { Bell, Search } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 260;

const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: `calc(100% - ${DRAWER_WIDTH}px)`
        }}
      >
        {/* Top Header */}
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="주문번호, 고객명, 상품명 검색 (Ctrl+K)" 
                  className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-[400px] transition-colors"
                />
              </div>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton sx={{ color: 'text.secondary' }}>
                <Bell size={20} />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1, pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    스마트스토어
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    대표관리자
                  </Typography>
                </Box>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontWeight: 600 }}>
                  A
                </Avatar>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: 4, flexGrow: 1, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
