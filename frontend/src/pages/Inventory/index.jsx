import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Chip, TextField, Grid, Tooltip } from '@mui/material';
import { Archive, TrendingUp, AlertTriangle, Check, ArrowRight, Lightbulb, PackagePlus } from 'lucide-react';
import apiClient from '../../api/client';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await apiClient.get('/products');
      // Mock safety stock (in reality, this would come from the backend)
      const data = res.data.map(p => ({
        ...p,
        safety_stock_level: 20
      }));
      
      // Sort logic: Out of stock first, then low stock, then normal
      data.sort((a, b) => {
        if (a.stock_quantity === 0 && b.stock_quantity !== 0) return -1;
        if (b.stock_quantity === 0 && a.stock_quantity !== 0) return 1;
        if (a.stock_quantity < a.safety_stock_level && b.stock_quantity >= b.safety_stock_level) return -1;
        if (b.stock_quantity < b.safety_stock_level && a.stock_quantity >= a.safety_stock_level) return 1;
        return a.stock_quantity - b.stock_quantity;
      });

      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError('재고 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = (quantity, safetyLevel) => {
    if (quantity === 0) return { label: '품절', color: 'error' };
    if (quantity < safetyLevel) return { label: '부족', color: 'warning' };
    if (quantity > safetyLevel * 5) return { label: '과잉', color: 'info' };
    return { label: '정상', color: 'success' };
  };

  const handleOpenOrder = (product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="primary" /></Box>;
  if (error) return <Box sx={{ mt: 4, mx: 3 }}><Alert severity="error" className="glass-panel">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }} className="animate-fade-in">
        <Box>
          <Typography variant="h2" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Archive size={28} /> 재고 관리
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            재고 흐름을 파악하고 적정 재고를 유지하세요.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="inherit">입출고 내역</Button>
          <Button variant="contained" color="primary" startIcon={<PackagePlus size={16} />}>신규 입고 등록</Button>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} className="animate-fade-in">
        {[
          { title: '전체 상품', value: products.length, color: '#fff' },
          { title: '품절 상품', value: products.filter(p => p.stock_quantity === 0).length, color: '#ef4444' },
          { title: '재고 부족', value: products.filter(p => p.stock_quantity > 0 && p.stock_quantity < p.safety_stock_level).length, color: '#f59e0b' },
          { title: '과잉 재고', value: products.filter(p => p.stock_quantity > p.safety_stock_level * 5).length, color: '#3b82f6' },
        ].map((stat, idx) => (
          <Grid item xs={6} md={3} key={idx}>
            <Box sx={{ p: 2, bgcolor: 'rgba(30, 30, 40, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: stat.color, mt: 1 }}>{stat.value}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box className="glass-panel animate-fade-in" sx={{ p: 0, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
        <TableContainer sx={{ maxHeight: '100%', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>상품명</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>건강도</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>현재 재고</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>안전 재고</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>본사 창고</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>물류 센터</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((p) => {
                const health = getHealthStatus(p.stock_quantity, p.safety_stock_level);
                return (
                  <TableRow 
                    key={p.origin_product_no} 
                    sx={{ 
                      bgcolor: health.label === '품절' ? 'rgba(239, 68, 68, 0.05)' : (health.label === '부족' ? 'rgba(245, 158, 11, 0.05)' : 'transparent'),
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } 
                    }}
                  >
                    <TableCell sx={{ fontWeight: '500' }}>
                      {p.product_name}
                      {health.label === '부족' && (
                        <Tooltip title={`최근 판매 추세 기반 권장 발주량: 150개`} placement="right">
                          <Lightbulb size={14} color="#f59e0b" style={{ marginLeft: 6, verticalAlign: 'middle', cursor: 'help' }} />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={health.label} size="small" color={health.color} sx={{ height: 24, fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 'bold', color: health.label === '품절' ? '#ef4444' : 'inherit' }}>
                        {p.stock_quantity}개
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{p.safety_stock_level}개</TableCell>
                    <TableCell>{Math.floor(p.stock_quantity * 0.7)}개</TableCell>
                    <TableCell>{Math.ceil(p.stock_quantity * 0.3)}개</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" startIcon={<ArrowRight size={14} />} color="info" onClick={() => setIsMoveModalOpen(true)}>이동</Button>
                        <Button size="small" variant="outlined" color="primary" onClick={() => handleOpenOrder(p)}>발주</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 발주 모달 */}
      <Dialog 
        open={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ style: { backgroundColor: '#1a1d24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <PackagePlus color="#10b981" size={24} /> 발주 생성
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedProduct && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>{selectedProduct.product_name}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">현재 재고</Typography>
                  <Typography variant="h6">{selectedProduct.stock_quantity}개</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">안전 재고</Typography>
                  <Typography variant="h6">{selectedProduct.safety_stock_level}개</Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Lightbulb size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>수요 예측 기반 발주 추천</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    최근 7일 판매량이 급증하고 있어 다음 주 주말 전까지 <strong>150개</strong> 추가 발주를 권장합니다.
                  </Typography>
                </Box>
              </Box>

              <TextField 
                fullWidth label="발주 수량" variant="outlined" type="number" sx={{ mt: 3, '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                defaultValue={150}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', p: 2 }}>
          <Button onClick={() => setIsOrderModalOpen(false)} color="inherit">취소</Button>
          <Button variant="contained" color="primary" onClick={() => { alert('발주가 완료되었습니다.'); setIsOrderModalOpen(false); }}>발주 승인</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
