import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Divider, CircularProgress, Alert } from '@mui/material';
import { Inbox, Clock, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';

const WorklistPanel = ({ onInquirySelect, selectedInquiry }) => {
  const [newInquiries, setNewInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await apiClient.get('/cs/inquiries');
        setNewInquiries(res.data);
      } catch (err) {
        setError('문의 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  if (loading) return <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress color="primary" /></Box>;
  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;

  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Inbox size={20} className="text-primary" /> 대기열
      </Typography>
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>새로 들어온 문의 ({newInquiries.length})</Typography>
        <List dense>
          {newInquiries.map(item => (
            <ListItemButton 
              key={item.question_id} 
              onClick={() => onInquirySelect(item)}
              sx={{ 
                borderRadius: '8px', mb: 1, 
                bgcolor: selectedInquiry?.question_id === item.question_id ? 'primary.main' : 'rgba(255,255,255,0.03)',
                '&:hover': { bgcolor: selectedInquiry?.question_id === item.question_id ? 'primary.main' : 'rgba(255,255,255,0.08)' }
              }}
            >
              <ListItemText 
                primary={item.question_text} 
                secondary={`ID: ${item.customer_id}`} 
                primaryTypographyProps={{ style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
              />
            </ListItemButton>
          ))}
          {newInquiries.length === 0 && <Typography variant="body2" color="text.secondary">대기 중인 문의가 없습니다.</Typography>}
        </List>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Clock size={16} /> 내가 처리 중인 문의 (0)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>없음</Typography>

        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle size={16} /> 처리 완료 (0)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>없음</Typography>
      </Box>
    </Box>
  );
};

export default WorklistPanel;
