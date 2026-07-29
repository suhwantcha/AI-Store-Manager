import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Grid } from '@mui/material';
import { Users, Star, AlertTriangle, Send, History } from 'lucide-react';
import apiClient from '../../api/client';

const CRM = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentTab, setCurrentTab] = useState('all'); // all, vip, at-risk
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchCustomers(currentTab);
  }, [currentTab]);

  const fetchCustomers = async (tab) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/crm/segments/${tab}`);
      setCustomers(res.data);
    } catch (err) {
      setError('고객 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (customer) => {
    setSelectedCustomer(customer);
    setModalLoading(true);
    try {
      const res = await apiClient.get(`/crm/customers/${customer.customer_id}/orders`);
      setCustomerOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleSendCoupon = async (customerId, type) => {
    try {
      await apiClient.post('/crm/coupons/send', { customerId, couponType: type });
      alert(`${type} 발송이 완료되었습니다.`);
    } catch (err) {
      alert('쿠폰 발송 중 오류가 발생했습니다.');
    }
  };

  const getSegmentStyle = (segment) => {
    switch (segment) {
      case 'VIP': return { bgcolor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' };
      case 'CHURN_RISK': return { bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'NEW': return { bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
      default: return { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#ccc', border: '1px solid rgba(255,255,255,0.2)' };
    }
  };

  const getSegmentLabel = (segment) => {
    if (segment === 'CHURN_RISK') return '이탈위험';
    if (segment === 'REGULAR') return '일반';
    if (segment === 'NEW') return '신규';
    return segment;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }} className="animate-fade-in">
        <Box>
          <Typography variant="h2" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Users size={28} /> 고객 CRM
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            고객별 구매 패턴을 파악하고 최적화된 마케팅 액션을 실행하세요.
          </Typography>
        </Box>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ minHeight: '36px' }}>
          <Tab value="all" label="전체 고객" sx={{ minHeight: '36px', py: 0 }} />
          <Tab value="vip" label="VIP 집중 관리" sx={{ minHeight: '36px', py: 0 }} />
          <Tab value="at-risk" label="이탈 위험 대응" sx={{ minHeight: '36px', py: 0 }} />
        </Tabs>
      </Box>

      {error && <Alert severity="error" className="glass-panel animate-fade-in">{error}</Alert>}

      <Box className="glass-panel animate-fade-in" sx={{ p: 0, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
        {loading ? (
          <Box sx={{ p: 10, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : (
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>고객명</TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>세그먼트</TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>누적 구매액</TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>총 주문수</TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>최근 주문일</TableCell>
                  <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>마케팅 액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((c) => (
                  <TableRow 
                    key={c.customer_id} 
                    hover 
                    onClick={() => handleOpenDetail(c)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                  >
                    <TableCell sx={{ fontWeight: '500' }}>{c.name}</TableCell>
                    <TableCell>
                      <Chip label={getSegmentLabel(c.segment)} size="small" sx={{ ...getSegmentStyle(c.segment), fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell>₩{(c.total_spend || 0).toLocaleString()}</TableCell>
                    <TableCell>{c.total_orders}회</TableCell>
                    <TableCell>{new Date(c.last_order_date).toLocaleDateString()}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {c.segment === 'CHURN_RISK' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            💡 장기 미방문
                          </Typography>
                          <Button size="small" variant="outlined" color="warning" onClick={() => handleSendCoupon(c.customer_id, '15% 웰컴백 쿠폰')}>쿠폰 발송</Button>
                        </Box>
                      )}
                      {c.segment === 'VIP' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            💡 충성 고객
                          </Typography>
                          <Button size="small" variant="outlined" color="secondary" onClick={() => handleSendCoupon(c.customer_id, 'VIP 전용 선물')}>선물 보내기</Button>
                        </Box>
                      )}
                      {c.segment !== 'CHURN_RISK' && c.segment !== 'VIP' && (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>해당하는 고객이 없습니다.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Customer Detail Modal */}
      <Dialog 
        open={!!selectedCustomer} 
        onClose={() => setSelectedCustomer(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { backgroundColor: '#1a1d24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        {selectedCustomer && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {selectedCustomer.name} 고객 프로필
                <Chip label={getSegmentLabel(selectedCustomer.segment)} size="small" sx={{ ...getSegmentStyle(selectedCustomer.segment), fontWeight: 'bold' }} />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">주 관심사</Typography>
                    <Typography variant="h6" sx={{ mt: 1, mb: 3 }}>{selectedCustomer.main_category}</Typography>
                    
                    <Typography variant="body2" color="text.secondary">누적 구매액 (LTV)</Typography>
                    <Typography variant="h6" sx={{ mt: 1, mb: 3, color: '#34d399' }}>₩{(selectedCustomer.total_spend || 0).toLocaleString()}</Typography>
                    
                    <Typography variant="body2" color="text.secondary">클레임 건수</Typography>
                    <Typography variant="h6" sx={{ mt: 1, color: selectedCustomer.total_claims > 2 ? '#f87171' : 'inherit' }}>{selectedCustomer.total_claims}건</Typography>
                  </Box>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <History size={18} /> 최근 주문 내역
                  </Typography>
                  {modalLoading ? (
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>
                  ) : (
                    <Box sx={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {customerOrders.length > 0 ? customerOrders.slice(0, 5).map(o => (
                        <Box key={o.order_id} sx={{ p: 2, mb: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{o.product_name}</Typography>
                            <Typography variant="body2">₩{o.total_amount?.toLocaleString()}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(o.payment_date).toLocaleDateString()} · {o.order_status}
                          </Typography>
                        </Box>
                      )) : (
                         <Typography variant="body2" color="text.secondary">최근 주문 내역이 없습니다.</Typography>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', p: 2 }}>
              <Button onClick={() => setSelectedCustomer(null)} color="inherit">닫기</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CRM;
