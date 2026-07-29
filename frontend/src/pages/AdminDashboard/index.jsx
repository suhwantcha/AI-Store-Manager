import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, CardContent, CircularProgress, Alert, List, ListItem, ListItemText, Divider, TextField, Button, Tabs, Tab, IconButton, Chip } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Package, MessageSquare, Send, Bell, Star } from 'lucide-react';
import apiClient from '../../api/client';

const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [negativeReviews, setNegativeReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Insights
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // CRM
  const [vipCustomers, setVipCustomers] = useState([]);
  const [atRiskCustomers, setAtRiskCustomers] = useState([]);
  const [selectedCustomerTab, setSelectedCustomerTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, warningsRes, salesRes, reviewsRes, vipRes, atRiskRes, insightsRes] = await Promise.all([
          apiClient.get('/dashboard/kpis'),
          apiClient.get('/dashboard/warnings'),
          apiClient.get('/dashboard/sales-trend'),
          apiClient.get('/reviews/negative'),
          apiClient.get('/crm/segments/vip'),
          apiClient.get('/crm/segments/at-risk'),
          apiClient.get('/dashboard/insights').catch(() => ({ data: { insights: [] } }))
        ]);

        setKpis(kpiRes.data);
        setWarnings(warningsRes.data);
        setSalesTrend(salesRes.data);
        setNegativeReviews(reviewsRes.data);
        setVipCustomers(vipRes.data);
        setAtRiskCustomers(atRiskRes.data);
        setInsights(insightsRes.data.insights || []);
        setInsightsLoading(false);

      } catch (err) {
        setError('대시보드 데이터를 불러오는 데 실패했습니다.');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleSendCoupon = async () => {
    if (atRiskCustomers.length === 0) {
      alert('이탈 위험 고객이 없습니다.');
      return;
    }
    const customerIds = atRiskCustomers.map(c => c.customer_id);
    try {
      await apiClient.post('/crm/coupons/send', {
        customerId: customerIds.join(','),
        couponType: "15% 할인쿠폰",
      });
      alert(`${customerIds.length}명의 고객에게 15% 할인쿠폰이 발송되었습니다.`);
    } catch (err) {
      alert('쿠폰 발송 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="primary" /></Box>;
  if (error) return <Box sx={{ mt: 4, mx: 3 }}><Alert severity="error" className="glass-panel">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="animate-fade-in">
        <Box>
          <Typography variant="h1" sx={{ color: 'primary.main', mb: 1 }}>AI Store OS</Typography>
          <Typography variant="body2" color="text.secondary">스마트스토어 운영을 위한 올인원 AI 대시보드</Typography>
        </Box>
        <Chip icon={<TrendingUp size={16} />} label="System Optimal" color="success" variant="outlined" />
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "미답변 문의", value: kpis.unansweredQnAs, icon: <MessageSquare size={24} color="#6366f1" />, color: "primary" },
          { title: "처리 대기 클레임", value: kpis.pendingClaims, icon: <AlertCircle size={24} color="#f59e0b" />, color: "warning" },
          { title: "재고 위험 상품", value: kpis.lowStockItems, icon: <Package size={24} color="#ef4444" />, color: "error" },
          { title: "VIP 고객 변동", value: vipCustomers.length, icon: <Star size={24} color="#10b981" />, color: "success" }
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Box className="glass-panel animate-fade-in" sx={{ p: 3, display: 'flex', alignItems: 'center', animationDelay: `${idx * 0.1}s`, height: '100%' }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: `${kpi.color}.dark`, display: 'flex', mr: 2, opacity: 0.8 }}>
                {kpi.icon}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>{kpi.title}</Typography>
                <Typography variant="h3">{kpi.value}</Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Box className="glass-panel animate-fade-in" sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp size={20} className="text-primary" /> 일간 매출 추이
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₩${(val/10000).toFixed(0)}만`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(26, 29, 36, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="total_settlement_amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        {/* Operational Insights */}
        <Grid item xs={12} lg={4}>
          <Box className="glass-panel animate-fade-in" sx={{ p: 0, height: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star size={18} color="#f59e0b" /> 운영 인사이트
              </Typography>
            </Box>
            <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {insightsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <List sx={{ pt: 0 }}>
                  {insights.map((insight, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 1.5, borderBottom: i < insights.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box sx={{ mt: 0.5, width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                          {insight}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <Button fullWidth variant="outlined" sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.1)' }}>
                자세히 보기
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Warnings & CRM */}
        <Grid item xs={12} md={6}>
          <Box className="glass-panel animate-fade-in" sx={{ p: 3, minHeight: '300px' }}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bell size={20} className="text-warning" /> 선제적 알림 (Warnings)
            </Typography>
            <List>
              {warnings.map((warn, i) => (
                <ListItem key={i} sx={{ px: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <AlertCircle size={16} color="#f59e0b" style={{ marginRight: '12px' }} />
                  <ListItemText primary={warn.product_name || '상품 경고'} secondary={`재고: ${warn.stock_quantity}개 남음`} />
                </ListItem>
              ))}
              {warnings.length === 0 && <Typography color="text.secondary">새로운 경고가 없습니다.</Typography>}
            </List>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="glass-panel animate-fade-in" sx={{ p: 3, minHeight: '300px' }}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={20} className="text-success" /> 고객 CRM</span>
              <Tabs value={selectedCustomerTab} onChange={(e, v) => setSelectedCustomerTab(v)} sx={{ minHeight: '32px' }}>
                <Tab label="VIP" sx={{ minHeight: '32px', py: 0 }} />
                <Tab label="이탈 위험" sx={{ minHeight: '32px', py: 0 }} />
              </Tabs>
            </Typography>
            <List sx={{ maxHeight: '200px', overflowY: 'auto' }}>
              {selectedCustomerTab === 0 ? vipCustomers.map(c => (
                <ListItem key={c.customer_id} sx={{ px: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {c.name} 
                        <Chip label="VIP" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontWeight: 'bold' }} />
                      </Box>
                    } 
                    secondary={`누적 ₩${(c.total_spend||0).toLocaleString()} (주문 ${c.total_orders}회)`} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
                    최근 30일 내 구매<br/>
                    (충성 고객)
                  </Typography>
                </ListItem>
              )) : atRiskCustomers.map(c => (
                <ListItem key={c.customer_id} sx={{ px: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {c.name} 
                        <Chip label="이탈위험" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 'bold' }} />
                      </Box>
                    } 
                    secondary={`누적 ₩${(c.total_spend||0).toLocaleString()} (주문 ${c.total_orders}회)`} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
                    60일 이상 미방문<br/>
                    (관리 요망)
                  </Typography>
                </ListItem>
              ))}
            </List>
            {selectedCustomerTab === 1 && atRiskCustomers.length > 0 && (
              <Button fullWidth variant="contained" color="warning" sx={{ mt: 2 }} onClick={handleSendCoupon}>
                위험 고객 쿠폰 발송
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;