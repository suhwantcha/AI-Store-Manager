import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Headphones, ShieldAlert, CheckCircle } from 'lucide-react';
import Chat from '../../components/Chat';
import CustomerInfoPanel from '../../components/Panels/CustomerInfoPanel';
import WorklistPanel from '../../components/Panels/WorklistPanel';

const CSAgentHub = () => {
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const handleInquirySelect = (inquiry) => {
    setSelectedInquiry(inquiry);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="animate-fade-in">
        <Box>
          <Typography variant="h2" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Headphones size={28} /> AI Customer Support Hub
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            고객 문의 및 클레임을 실시간으로 관리하고 AI 에이전트와 협업하세요.
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden', pb: 2 }}>
        {/* 왼쪽 열: 문의 대기열 */}
        <Grid item xs={12} md={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box className="glass-panel animate-fade-in" sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>
            <WorklistPanel onInquirySelect={handleInquirySelect} selectedInquiry={selectedInquiry} />
          </Box>
        </Grid>

        {/* 가운데 열: 채팅 패널 */}
        <Grid item xs={12} md={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box className="glass-panel animate-fade-in" sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: '0.2s' }}>
            <Chat 
              key={selectedInquiry ? selectedInquiry.question_id : 'initial'}
              inquiry={selectedInquiry} 
            />
          </Box>
        </Grid>

        {/* 오른쪽 열: 고객 정보 패널 */}
        <Grid item xs={12} md={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box className="glass-panel animate-fade-in" sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: '0.3s' }}>
            <CustomerInfoPanel 
              customerId={selectedInquiry ? selectedInquiry.customer_id : null} 
              inquiry={selectedInquiry}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CSAgentHub;