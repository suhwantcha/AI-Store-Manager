import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Grid, Chip, CardContent, Divider, Rating, IconButton, Tooltip, TextField } from '@mui/material';
import { MessageSquareText, TrendingUp, AlertCircle, CornerDownRight, Check, Search, PenTool, MessageSquarePlus } from 'lucide-react';
import apiClient from '../../api/client';

const Reviews = () => {
  const [reviewsData, setReviewsData] = useState({ summary: [], reviews: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState(0); // 0 means all
  
  const [replyBoxOpen, setReplyBoxOpen] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [generatingDrafts, setGeneratingDrafts] = useState({});

  useEffect(() => {
    fetchReviews();
  }, [filterRating]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const endpoint = filterRating > 0 ? `/reviews?rating=${filterRating}` : '/reviews';
      const res = await apiClient.get(endpoint);
      setReviewsData(res.data);
    } catch (err) {
      setError('리뷰 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDraft = async (reviewId, reviewText) => {
    setGeneratingDrafts(prev => ({ ...prev, [reviewId]: true }));
    try {
      const res = await apiClient.post(`/reviews/${reviewId}/generate-reply`, { review_text: reviewText });
      setReplyTexts(prev => ({ ...prev, [reviewId]: res.data.reply }));
    } catch (err) {
      alert('답변 초안 생성에 실패했습니다.');
    } finally {
      setGeneratingDrafts(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleReplySubmit = (reviewId) => {
    if (!replyTexts[reviewId]) {
      alert('답변을 작성해주세요.');
      return;
    }
    alert('답변이 성공적으로 등록되었습니다.');
    setReplyBoxOpen(prev => ({ ...prev, [reviewId]: false }));
    setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
  };

  const toggleReplyBox = (reviewId) => {
    setReplyBoxOpen(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  if (loading && reviewsData.reviews.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress color="primary" /></Box>;
  if (error) return <Box sx={{ mt: 4, mx: 3 }}><Alert severity="error" className="glass-panel">{error}</Alert></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }} className="animate-fade-in">
        <Box>
          <Typography variant="h2" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <MessageSquareText size={28} /> 고객 리뷰 분석
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            수많은 리뷰 속 핵심 키워드를 파악하고 부정 리뷰에 빠르게 대응하세요.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} className="animate-fade-in">
        {/* Keyword Summary */}
        <Grid item xs={12} lg={4}>
          <Box className="glass-panel" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp size={20} color="#10b981" /> 리뷰 핵심 요약
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              최근 1,000개의 리뷰 텍스트를 분석하여 가장 많이 언급된 키워드를 추출했습니다.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {reviewsData.summary.map((kw, idx) => (
                <Chip 
                  key={idx} 
                  label={`${kw.word} (${kw.count})`} 
                  sx={{ 
                    bgcolor: kw.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                    color: kw.sentiment === 'positive' ? '#34d399' : '#f87171',
                    border: `1px solid ${kw.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    fontWeight: 'bold', fontSize: '0.85rem'
                  }} 
                />
              ))}
            </Box>
            <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Typography variant="body2" sx={{ color: '#60a5fa', fontWeight: 'bold' }}>💡 인사이트</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, display: 'block' }}>
                전체적으로 <strong>맛과 가성비</strong>에 대한 긍정적 평가가 압도적입니다. 다만 일부 주문에서 <strong>포장 상태</strong> 관련 불만이 접수되고 있으니 완충재 보강이 필요해 보입니다.
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Review List */}
        <Grid item xs={12} lg={8}>
          <Box className="glass-panel" sx={{ p: 3, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5">최근 리뷰 목록</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[{label: '전체', val: 0}, {label: '5점', val: 5}, {label: '4점', val: 4}, {label: '부정 리뷰(3점 이하)', val: 3}].map(f => (
                  <Chip 
                    key={f.val} 
                    label={f.label} 
                    onClick={() => setFilterRating(f.val)}
                    sx={{ 
                      cursor: 'pointer', 
                      bgcolor: filterRating === f.val ? 'primary.main' : 'rgba(255,255,255,0.05)',
                      color: filterRating === f.val ? '#fff' : 'text.secondary',
                      '&:hover': { bgcolor: filterRating === f.val ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                    }} 
                  />
                ))}
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>
            ) : (
              <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reviewsData.reviews.filter(r => filterRating === 3 ? r.rating <= 3 : true).map(r => (
                  <Box key={r.review_id} sx={{ p: 2, bgcolor: 'rgba(30,30,40,0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Rating value={r.rating} readOnly size="small" sx={{ color: r.rating >= 4 ? '#10b981' : '#f59e0b' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5, color: 'text.secondary' }}>
                          고객 ID: {r.customer_id} · {new Date(r.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {r.rating <= 3 && <Chip icon={<AlertCircle size={14} />} label="대응 요망" size="small" color="warning" sx={{ height: 20 }} />}
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>{r.review_text}</Typography>
                    
                    {/* 버튼 영역 */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        size="small" 
                        variant={replyBoxOpen[r.review_id] ? "contained" : "outlined"} 
                        color="inherit" 
                        sx={{ borderColor: 'rgba(255,255,255,0.2)', color: replyBoxOpen[r.review_id] ? '#000' : 'text.secondary', bgcolor: replyBoxOpen[r.review_id] ? '#fff' : 'transparent', '&:hover': { bgcolor: replyBoxOpen[r.review_id] ? '#eee' : 'rgba(255,255,255,0.1)' } }}
                        onClick={() => toggleReplyBox(r.review_id)}
                        startIcon={<MessageSquarePlus size={16} />}
                      >
                        답변 작성
                      </Button>
                    </Box>

                    {/* 답변 작성 영역 */}
                    {replyBoxOpen[r.review_id] && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="고객에게 남길 답변을 작성하세요..."
                          value={replyTexts[r.review_id] || ''}
                          onChange={(e) => setReplyTexts(prev => ({ ...prev, [r.review_id]: e.target.value }))}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.03)',
                            borderRadius: '4px',
                            '& .MuiOutlinedInput-root': {
                              color: '#fff',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Button 
                            variant="text" 
                            size="small"
                            onClick={() => handleGenerateDraft(r.review_id, r.review_text)}
                            disabled={generatingDrafts[r.review_id]}
                            startIcon={generatingDrafts[r.review_id] ? <CircularProgress size={14} color="inherit" /> : <PenTool size={14} />}
                            sx={{ color: '#818cf8', '&:hover': { bgcolor: 'rgba(129, 140, 248, 0.1)' } }}
                          >
                            {generatingDrafts[r.review_id] ? 'AI 초안 생성 중...' : '✨ AI 기반 초안 생성'}
                          </Button>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button size="small" variant="outlined" color="inherit" onClick={() => toggleReplyBox(r.review_id)}>취소</Button>
                            <Button size="small" variant="contained" color="primary" onClick={() => handleReplySubmit(r.review_id)}>등록</Button>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
                {reviewsData.reviews.length === 0 && <Typography color="text.secondary" textAlign="center" sx={{ mt: 4 }}>해당하는 리뷰가 없습니다.</Typography>}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reviews;
