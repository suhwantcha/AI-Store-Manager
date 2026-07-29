import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent } from '@mui/material';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2, TrendingUp, AlertTriangle, Lightbulb, PackageSearch } from 'lucide-react';
import apiClient from '../../api/client';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.get('/analytics/summary');
      setData(res.data);
    } catch (err) {
      setError('매출 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="primary" /></Box>;
  if (error) return <Box sx={{ mt: 4, mx: 3 }}><Alert severity="error" className="glass-panel">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }} className="animate-fade-in">
        <Box>
          <Typography variant="h2" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChart2 size={28} /> 매출 분석
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            판매 동향을 분석하고 인사이트를 얻어보세요.
          </Typography>
        </Box>
      </Box>

      {/* 스마트 브리핑 (자연스러운 AI 요소) */}
      <Box className="glass-panel animate-fade-in" sx={{ p: 3, borderLeft: '4px solid #6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Lightbulb size={20} color="#818cf8" />
          <Typography variant="subtitle1" sx={{ color: '#818cf8', fontWeight: 'bold' }}>스마트 브리핑</Typography>
        </Box>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          {data?.briefing || '데이터 분석 중입니다...'}
        </Typography>
      </Box>

      <Grid container spacing={3} className="animate-fade-in" sx={{ animationDelay: '0.1s' }}>
        {/* Weekly Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Box className="glass-panel" sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp size={20} color="#10b981" /> 주간 매출 추이
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.weekly_sales || []}>
                  <defs>
                    <linearGradient id="colorSalesAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₩${(val/10000).toFixed(0)}만`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(26, 29, 36, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val) => `₩${val.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesAnalytics)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} lg={4}>
          <Box className="glass-panel" sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PackageSearch size={20} color="#f59e0b" /> 인기 상품 마진율 Top 5
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.top_products || []} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(26, 29, 36, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    formatter={(val) => `₩${val.toLocaleString()}`}
                  />
                  <Bar dataKey="margin" radius={[0, 4, 4, 0]}>
                    {
                      (data?.top_products || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#3b82f6'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
