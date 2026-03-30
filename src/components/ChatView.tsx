import { Box, Flex, Text, TextInput, Stack, ActionIcon, Avatar, Paper } from '@mantine/core';
import { MagicWandIcon, PaperPlaneIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export default function ChatView() {
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: "I've analyzed your workflow this week. You're most productive between 10 AM and 1 PM. However, you tend to slow down after lunch when working on Auth Modules. Would you like to schedule high-complexity tasks for your morning slots tomorrow?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Get recent logs for context
      const logs = await invoke('get_productivity_stats', { days: 1 });
      const response = await invoke('chat_with_ai', { message: input, history: logs }) as string;
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error communicating with AI assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Stack flex={1} gap="xl" style={{ overflowY: 'auto' }} pr="md">
        {messages.map((msg, i) => (
          <Flex key={i} direction="column" align={msg.role === 'user' ? 'flex-end' : 'flex-start'}>
            <Flex gap="md" align="flex-start" style={{ maxWidth: '80%' }}>
              {msg.role === 'assistant' && (
                <ActionIcon size="md" variant="light" color="violet" radius="sm">
                  <MagicWandIcon />
                </ActionIcon>
              )}
              
              <Paper 
                p="md" 
                radius="lg" 
                bg={msg.role === 'user' ? 'dark.3' : 'dark.5'}
                style={{
                  border: '1px solid rgba(72, 72, 72, 0.15)',
                  backgroundColor: msg.role === 'user' ? '#1a1b1b' : '#252626'
                }}
              >
                <Text fz="sm" c="gray.1" style={{ lineHeight: 1.6 }}>
                  {msg.content}
                </Text>
              </Paper>

              {msg.role === 'user' && (
                <Avatar size="md" />
              )}
            </Flex>
          </Flex>
        ))}
        {loading && (
             <Flex gap="md" align="flex-start">
                  <ActionIcon size="md" variant="light" color="violet" radius="sm">
                      <MagicWandIcon />
                  </ActionIcon>
                  <Text fz="sm" c="gray.6">AI is thinking...</Text>
             </Flex>
        )}
      </Stack>

      <Box pt="xl">
        <TextInput
          placeholder="Ask me about your productivity..."
          size="lg"
          rightSection={
            <ActionIcon size="lg" variant="filled" color="violet" onClick={sendMessage}>
              <PaperPlaneIcon />
            </ActionIcon>
          }
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          styles={{
            input: {
              backgroundColor: '#131313',
              border: '1px solid rgba(218, 185, 255, 0.15)',
              borderRadius: '24px'
            }
          }}
        />
      </Box>
    </Box>
  );
}
