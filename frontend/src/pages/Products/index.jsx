import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Chip, Card, CardContent } from '@mui/material';
import { Package, Sparkles, Check, Edit2, Plus, Image as ImageIcon, TrendingUp, Star, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', features: '', description: '', price: '', cost: '', category: '' });
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('상품 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!newProduct.name) {
      alert('상품명을 입력해주세요.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await apiClient.post('/products/ai-description', {
        product_name: newProduct.name,
        key_features: newProduct.features || '특징 없음'
      });
      setNewProduct(prev => ({ ...prev, description: res.data.draft_description }));
    } catch (err) {
      alert('초안 작성 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRegisterProduct = () => {
    alert('상품이 성공적으로 등록되었습니다.');
    setIsAddModalOpen(false);
    setNewProduct({ name: '', features: '', description: '', price: '', cost: '', category: '' });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="primary" /></Box>;
  if (error) return <Box sx={{ mt: 4, mx: 3 }}><Alert severity="error" className="glass-panel">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }} className="animate-fade-in">
        <Box>
          <Typography variant="h2" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Package size={28} /> 상품 관리
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            판매할 상품을 관리하고 주요 성과를 확인하세요.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Plus size={18} />}
          onClick={() => setIsAddModalOpen(true)}
          sx={{ borderRadius: '8px', px: 3, fontWeight: 'bold' }}
        >
          신규 상품 등록
        </Button>
      </Box>

      {/* Sales Performance Cards */}
      <Grid container spacing={2} className="animate-fade-in">
        {[
          { title: '이번 달 매출액', value: '₩12,450,000', icon: <TrendingUp size={20} color="#10b981" />, change: '+12.5%' },
          { title: '전체 판매량', value: '1,240 개', icon: <Package size={20} color="#3b82f6" />, change: '+5.2%' },
          { title: '평균 평점', value: '4.8 / 5.0', icon: <Star size={20} color="#f59e0b" />, change: '+0.1' },
          { title: '반품률 경고', value: '2.1%', icon: <AlertCircle size={20} color="#ef4444" />, change: '-0.5%' },
        ].map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ bgcolor: 'rgba(30, 30, 40, 0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">{card.title}</Typography>
                  {card.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: '#fff' }}>{card.value}</Typography>
                <Typography variant="caption" sx={{ color: card.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                  {card.change} (전월 대비)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box className="glass-panel animate-fade-in" sx={{ p: 0, flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
        <TableContainer sx={{ maxHeight: '100%', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold', width: 60 }}></TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>상품명</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>카테고리</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>판매가</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>원가</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>상태</TableCell>
                <TableCell sx={{ bgcolor: 'rgba(30, 30, 40, 0.95)', color: 'text.secondary', fontWeight: 'bold' }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.origin_product_no} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell>
                    <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={20} color="rgba(255,255,255,0.5)" />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{p.product_name}</TableCell>
                  <TableCell><Chip label={p.category_name || '미분류'} size="small" variant="outlined" sx={{ color: 'text.secondary', borderColor: 'rgba(255,255,255,0.2)' }} /></TableCell>
                  <TableCell>₩{p.sale_price?.toLocaleString()}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>₩{p.cost_price?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label="판매중" size="small" color="success" sx={{ height: 24, fontSize: '0.75rem' }} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Edit2 size={14} />} color="info">수정</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add Product Modal */}
      <Dialog 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { backgroundColor: '#1a1d24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Package color="#6366f1" size={24} /> 신규 상품 등록
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ width: '100%', height: 200, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                <ImageIcon size={32} color="rgba(255,255,255,0.5)" style={{ marginBottom: '8px' }} />
                <Typography variant="body2" color="text.secondary">클릭하여 대표 이미지 업로드</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth label="상품명" variant="outlined" size="small"
                    value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    InputLabelProps={{ style: { color: '#94a3b8' } }}
                    sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth label="판매가 (₩)" variant="outlined" size="small" type="number"
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    InputLabelProps={{ style: { color: '#94a3b8' } }}
                    sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                    fullWidth label="카테고리" variant="outlined" size="small"
                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    InputLabelProps={{ style: { color: '#94a3b8' } }}
                    sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth label="옵션 (예: 색상, 사이즈)" variant="outlined" size="small"
                    placeholder="콤마(,)로 구분하여 입력"
                    InputLabelProps={{ style: { color: '#94a3b8' } }}
                    sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Smart Description Area */}
            <Grid item xs={12}>
              <Box sx={{ mt: 1, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>상품 상세 설명</Typography>
                  <Button 
                    size="small" 
                    variant="text" 
                    color="secondary" 
                    startIcon={aiLoading ? <CircularProgress size={14} color="inherit" /> : <Sparkles size={14} />}
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                  >
                    ✨ 초안 작성 및 키워드 추천
                  </Button>
                </Box>
                <TextField 
                  fullWidth variant="outlined" multiline rows={6}
                  placeholder="상품의 특징, 장점, 주의사항 등을 자세히 적어주세요."
                  value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  InputLabelProps={{ style: { color: '#94a3b8' } }}
                  sx={{ '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' } } }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.05)', p: 2 }}>
          <Button onClick={() => setIsAddModalOpen(false)} color="inherit">취소</Button>
          <Button onClick={handleRegisterProduct} variant="contained" color="primary" startIcon={<Check size={16} />}>
            상품 등록 완료
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
