import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment, Menu, MenuItem, Tooltip, Stepper, Step, StepLabel } from '@mui/material';
import { ShoppingCart, Search, Filter, Truck, PackageCheck, AlertTriangle, Send, Phone, Download, MessageSquareText } from 'lucide-react';
import apiClient from '../../api/client';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter logic
    let result = orders;
    if (statusFilter !== '전체') {
      result = result.filter(o => o.order_status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        (o.product_order_id && o.product_order_id.toLowerCase().includes(q)) ||
        (o.customer_id && o.customer_id.toLowerCase().includes(q)) ||
        (o.product_name && o.product_name.toLowerCase().includes(q))
      );
    }
    
    // Sort logic: Delayed -> VIP -> CHURN_RISK
    result.sort((a, b) => {
      // 1. 배송지연 우선
      if (a.order_status === '배송지연' && b.order_status !== '배송지연') return -1;
      if (b.order_status === '배송지연' && a.order_status !== '배송지연') return 1;
      
      // 2. VIP 우선
      if (a.customer_segment === 'VIP' && b.customer_segment !== 'VIP') return -1;
      if (b.customer_segment === 'VIP' && a.customer_segment !== 'VIP') return 1;
      
      // 3. 이탈위험(CHURN_RISK) 우선
      if (a.customer_segment === 'CHURN_RISK' && b.customer_segment !== 'CHURN_RISK') return -1;
      if (b.customer_segment === 'CHURN_RISK' && a.customer_segment !== 'CHURN_RISK') return 1;

      return new Date(b.payment_date) - new Date(a.payment_date);
    });

    setFilteredOrders(result);
  }, [orders, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data);
    } catch (err) {
      setError('주문 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case '결제완료': return { bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }; // Blue
      case '배송준비중': return { bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }; // Orange
      case '배송중': return { bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }; // Indigo
      case '배송완료': return { bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }; // Green
      case '배송지연': return { bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }; // Red
      case '취소': return { bgcolor: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.3)' }; // Gray
      case '환불': return { bgcolor: 'rgba(217, 70, 239, 0.15)', color: '#e879f9', border: '1px solid rgba(217, 70, 239, 0.3)' }; // Fuchsia/Pink
      default: return { bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#ccc', border: '1px solid rgba(255,255,255,0.2)' };
    }
  };

  // Mock Timeline steps
  const steps = ['주문 접수', '결제 완료', '상품 준비', '배송 중', '배송 완료'];
  const getActiveStep = (status) => {
    switch(status) {
      case '결제완료': return 1;
      case '배송준비중': return 2;
      case '배송중': return 3;
      case '배송완료': return 4;
      default: return 0; // 취소, 지연 등 예외 처리는 단순화
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="primary" /></Box>;
  if (error) return <Box sx={{ mt: 4, mx: 3 }}><Alert severity="error" className="glass-panel">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }} className="animate-fade-in">
        <Box>
          <Typography variant="h2" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCart size={28} /> 주문 관리
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            고객 주문을 처리하고 배송 상태를 한눈에 파악하세요.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="inherit" startIcon={<Download size={16} />}>내보내기</Button>
          <Button variant="contained" color="primary" startIcon={<Truck size={16} />}>일괄 송장 등록</Button>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }} className="animate-fade-in">
        <TextField 
          placeholder="주문번호, 고객명, 상품명 검색"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search size={18} color="#94a3b8" /></InputAdornment>,
            style: { color: '#fff' }
          }}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.03)', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
        />
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          {['전체', '결제완료', '배송준비중', '배송중', '배송완료', '배송지연', '취소', '환불'].map(status => (
            <Chip 
              key={status} 
              label={status} 
              onClick={() => setStatusFilter(status)}
              color={statusFilter === status ? 'primary' : 'default'}
              variant={statusFilter === status ? 'filled' : 'outlined'}
              sx={{ borderColor: 'rgba(255,255,255,0.2)' }}
            />
          ))}
        </Box>
      </Box>

      <Box className="glass-panel animate-fade-in" sx={{ p: 0, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TableContainer sx={{ maxHeight: '100%', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>주문일시</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>주문번호</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>상품명</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>고객명(ID)</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>결제금액</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => {
                const isDelayed = order.order_status === '배송지연';
                return (
                  <TableRow 
                    key={order.product_order_id} 
                    hover
                    onClick={() => handleOpenDetail(order)}
                    sx={{ 
                      cursor: 'pointer',
                      bgcolor: isDelayed ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } 
                    }}
                  >
                    <TableCell>{new Date(order.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {order.product_order_id}
                      {isDelayed && <Tooltip title="우선 처리 요망"><AlertTriangle size={14} color="#ef4444" style={{ marginLeft: 8, verticalAlign: 'middle' }} /></Tooltip>}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.product_name}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{order.customer_name || order.customer_id}</Typography>
                        {order.customer_segment === 'VIP' && (
                          <Chip label="VIP" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontWeight: 'bold' }} />
                        )}
                        {order.customer_segment === 'CHURN_RISK' && (
                          <Chip label="이탈위험" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 'bold' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>₩{order.total_amount?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      <Chip label={order.order_status} size="small" sx={{ ...getStatusStyle(order.order_status), fontWeight: 'bold' }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Order Detail Modal */}
      <Dialog 
        open={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { backgroundColor: '#1a1d24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PackageCheck color="#6366f1" size={24} /> 
                주문 상세 내역
              </Box>
              <Chip label={selectedOrder.order_status} sx={{ ...getStatusStyle(selectedOrder.order_status), fontWeight: 'bold' }} />
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              {/* Timeline */}
              <Box sx={{ width: '100%', mb: 6, mt: 2 }}>
                <Stepper activeStep={getActiveStep(selectedOrder.order_status)} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.7)' }, '& .MuiStepLabel-label.Mui-active': { color: '#fff', fontWeight: 'bold' } }}>
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>주문 정보</Typography>
                  <Typography variant="body1"><strong>주문번호:</strong> {selectedOrder.product_order_id}</Typography>
                  <Typography variant="body1"><strong>결제일시:</strong> {selectedOrder.payment_date}</Typography>
                  <Typography variant="body1"><strong>상품명:</strong> {selectedOrder.product_name}</Typography>
                  <Typography variant="body1"><strong>결제금액:</strong> ₩{selectedOrder.total_amount?.toLocaleString() || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>배송/고객 정보</Typography>
                  <Typography variant="body1"><strong>고객 ID:</strong> {selectedOrder.customer_id}</Typography>
                  <Typography variant="body1"><strong>배송 메모:</strong> {selectedOrder.claim_reason || '문 앞 배송 요청'}</Typography>
                  
                  {selectedOrder.order_status === '배송지연' && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AlertTriangle size={16} /> 배송 지연 감지됨
                        </Typography>
                        <Tooltip title="AI 제안 메시지 생성">
                          <IconButton size="small" sx={{ color: '#fbbf24' }}>
                            <MessageSquareText size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        "고객님, 주문하신 상품의 배송이 지연되어 대단히 죄송합니다. 내일 오후 중으로 출고될 예정입니다."
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="warning" startIcon={<Send size={14}/>}>메시지 전송</Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', p: 2 }}>
              <Button startIcon={<Phone size={16} />} color="inherit" sx={{ mr: 'auto' }}>고객 연락</Button>
              <Button onClick={() => setIsDetailModalOpen(false)} color="inherit">닫기</Button>
              <Button variant="contained" color="primary">저장 및 배송 시작</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Orders;
