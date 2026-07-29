import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Avatar, CircularProgress, Paper, Chip } from '@mui/material';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import apiClient from '../../api/client';

const AIManager = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요 대표님! StoreManager OS의 통합 AI 비즈니스 매니저입니다.\n재고 현황, 고객 관리, 최근 리뷰 등 상점 운영에 대해 무엇이든 편하게 물어보세요.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/manager/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response, tools_used: response.data.tools_used }]);
    } catch (error) {
      console.error('Failed to chat with AI Manager:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다. 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }} className="animate-fade-in">
        <Sparkles size={28} color="#a855f7" />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          AI 매니저
        </Typography>
      </Box>

      <Paper 
        className="glass-panel animate-fade-in" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          borderRadius: 4,
          animationDelay: '0.1s'
        }}
      >
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {messages.map((msg, idx) => (
            <Box 
              key={idx} 
              sx={{ 
                display: 'flex', 
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 2,
                animation: 'fade-in 0.3s ease-out'
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(99, 102, 241, 0.2)',
                  color: msg.role === 'user' ? '#fff' : '#818cf8',
                  width: 40, height: 40
                }}
              >
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </Avatar>
              
              <Box sx={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <Box 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 3,
                    borderTopRightRadius: msg.role === 'user' ? 0 : 3,
                    borderTopLeftRadius: msg.role === 'assistant' ? 0 : 3,
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <Box sx={{ 
                    '& p': { m: 0, mb: 1, lineHeight: 1.6 }, 
                    '& p:last-child': { mb: 0 },
                    '& ul, & ol': { mt: 0, mb: 0, pl: 2, lineHeight: 1.6 },
                    '& li': { mb: 0.5 },
                    fontSize: '0.95rem'
                  }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </Box>
                </Box>
                
                {msg.role === 'assistant' && msg.tools_used && msg.tools_used.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {msg.tools_used.map((tool, i) => (
                      <Chip 
                        key={i} 
                        label={`🛠 ${tool.replace(/_tool$/, '').replace(/_/g, ' ')}`} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.05)', 
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                          height: 20
                        }} 
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', width: 40, height: 40 }}>
                <Bot size={20} />
              </Avatar>
              <Box sx={{ display: 'flex', gap: 1, p: 2, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                <CircularProgress size={20} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">AI 매니저가 분석 중입니다...</Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="AI 매니저에게 스토어 현황에 대해 물어보세요... (Shift+Enter로 줄바꿈)"
            disabled={isLoading}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <IconButton 
                  color="primary" 
                  onClick={handleSend} 
                  disabled={!input.trim() || isLoading}
                  sx={{ 
                    bgcolor: input.trim() && !isLoading ? 'primary.main' : 'rgba(255,255,255,0.05)', 
                    color: input.trim() && !isLoading ? '#fff' : 'text.disabled',
                    borderRadius: 2,
                    p: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: input.trim() && !isLoading ? 'primary.dark' : 'rgba(255,255,255,0.05)',
                    }
                  }}
                >
                  <Send size={20} />
                </IconButton>
              ),
              sx: {
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 3,
                pr: 1,
                '& fieldset': { border: 'none' },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                '&.Mui-focused': { bgcolor: 'rgba(255, 255, 255, 0.05)', boxShadow: 'inset 0 0 0 1px rgba(99, 102, 241, 0.5)' }
              }
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default AIManager;
