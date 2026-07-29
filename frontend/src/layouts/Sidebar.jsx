import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  ShoppingCart,
  Star,
  Users,
  TrendingUp,
  Settings,
  Bot
} from 'lucide-react';

const DRAWER_WIDTH = 260;

const menuItems = [
  { path: '/', label: '대시보드', icon: <LayoutDashboard size={20} /> },
  { path: '/cs', label: 'AI 고객 지원', icon: <MessageSquare size={20} /> },
  { path: '/orders', label: '주문 관리', icon: <ShoppingCart size={20} /> },
  { path: '/products', label: '상품/재고', icon: <Package size={20} /> },
  { path: '/reviews', label: '리뷰 지능', icon: <Star size={20} /> },
  { path: '/crm', label: '고객 CRM', icon: <Users size={20} /> },
  { path: '/analytics', label: '매출 분석', icon: <TrendingUp size={20} /> },
  { path: '/copilot', label: 'AI 코파일럿', icon: <Bot size={20} /> },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
          }}
        >
          A
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
          StoreManager OS
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, fontWeight: 600 }}>
          MAIN MENU
        </Typography>
      </Box>

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <ListItem 
              key={item.path} 
              disablePadding 
              sx={{ mb: 0.5 }}
            >
              <Box
                component={NavLink}
                to={item.path}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  px: 2,
                  py: 1.2,
                  borderRadius: '10px',
                  color: isActive ? 'white' : 'text.secondary',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 36, 
                    color: isActive ? '#6366f1' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem'
                  }} 
                />
              </Box>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      
      <Divider sx={{ mx: 2, my: 2 }} />
      
      <List sx={{ px: 2, pb: 3 }}>
        <ListItem disablePadding>
          <Box
            component={NavLink}
            to="/settings"
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              px: 2,
              py: 1.2,
              borderRadius: '10px',
              color: 'text.secondary',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <Settings size={20} />
            </ListItemIcon>
            <ListItemText primary="설정" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
          </Box>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
