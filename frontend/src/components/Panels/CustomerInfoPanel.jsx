import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, CircularProgress, Alert, Chip, Stack, Grid } from '@mui/material';
import { User, ShoppingBag, AlertTriangle, MessageCircle, BookOpen } from 'lucide-react';
import apiClient from '../../api/client';

const CustomerInfoPanel = ({ customerId, inquiry }) => {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [claims, setClaims] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recommendedManual, setRecommendedManual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId) {
      setCustomer(null);
      setOrders([]);
      setClaims([]);
      setReviews([]);
      setRecommendedManual(null);
      return;
    }

    const fetchCustomerData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [custRes, ordRes, claimRes, revRes] = await Promise.all([
          apiClient.get('/crm/segments/all'),
          apiClient.get(`/crm/customers/${customerId}/orders`),
          apiClient.get(`/crm/customers/${customerId}/claims`),
          apiClient.get(`/crm/customers/${customerId}/reviews`),
        ]);

        const currentCustomer = custRes.data.find(c => c.customer_id === customerId);
        setCustomer(currentCustomer);
        setOrders(ordRes.data);
        setClaims(claimRes.data);
        setReviews(revRes.data);
      } catch (err) {
        setError('고객 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId]);

  useEffect(() => {
    if (inquiry && inquiry.question_text) {
        setRecommendedManual("[SM-CS-QUAL-102: 포장 누수]"); // Dummy for now
    } else {
        setRecommendedManual(null);
    }
  }, [inquiry]);

  if (loading) return <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress color="primary" /></Box>;
  
  if (!customerId) {
    return (
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        <User size={48} opacity={0.5} style={{ marginBottom: '16px' }} />
        <Typography variant="body1">왼쪽에서 문의를 선택하면</Typography>
        <Typography variant="body2">고객 정보가 여기에 표시됩니다.</Typography>
      </Box>
    );
  }

  if (error && !customer) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <User size={20} className="text-primary" /> 고객 360° 뷰
      </Typography>
      
      {customer ? (
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{customer.name}</Typography>
            <Chip size="small" label={customer.segment} color={customer.segment === 'VIP' ? 'success' : 'warning'} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>ID: {customer.customer_id}</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">총 구매액</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>₩{customer.total_spend?.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">총 구매건수</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{customer.total_orders}건</Typography>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>해당 고객을 찾을 수 없습니다.</Typography>
      )}

      {/* Orders */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
        <ShoppingBag size={16} /> 최근 주문
      </Typography>
      <Box sx={{ mb: 3 }}>
        {orders.length > 0 ? orders.slice(0, 3).map((o, i) => (
          <Typography key={i} variant="body2" sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '6px', mb: 0.5 }}>
            • {o.productInfo?.productName} <span style={{color: '#6366f1'}}>({o.orderStatus})</span>
          </Typography>
        )) : <Typography variant="caption" color="text.secondary">주문 내역 없음</Typography>}
      </Box>

      {/* Claims */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
        <AlertTriangle size={16} /> 과거 클레임
      </Typography>
      <Box sx={{ mb: 3 }}>
        {claims.length > 0 ? claims.slice(0, 3).map((c, i) => (
          <Typography key={i} variant="body2" sx={{ p: 1, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '6px', mb: 0.5 }}>
            • {c.claim_reason} ({c.claim_type})
          </Typography>
        )) : <Typography variant="caption" color="text.secondary">클레임 내역 없음</Typography>}
      </Box>

      {/* Manual */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
        <BookOpen size={16} /> 추천 매뉴얼
      </Typography>
      <Box sx={{ p: 1.5, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
        {recommendedManual ? (
          <Typography variant="body2">💡 {recommendedManual} 매뉴얼을 참조하세요.</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">추천 매뉴얼이 없습니다.</Typography>
        )}
      </Box>

    </Box>
  );
};

export default CustomerInfoPanel;
