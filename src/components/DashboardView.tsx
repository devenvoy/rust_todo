import { Box, Flex, Text, Title, Stack } from '@mantine/core';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ProductiveLog {
    timestamp: number;
    activity_type: string;
    duration: number;
}

export default function DashboardView() {
  const [stats, setStats] = useState<ProductiveLog[]>([]);

  const loadStats = async () => {
    try {
      const logs = await invoke('get_productivity_stats', { days: 7 }) as ProductiveLog[];
      setStats(logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const processData = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = new Date().getDay();
    
    // Create an array for the last 7 days starting from today back to 6 days ago
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const dayIdx = (today - i + 7) % 7;
        last7Days.push(days[dayIdx]);
    }

    return last7Days.map(dayName => {
        const dayLogs = stats.filter(log => {
            const date = new Date(log.timestamp * 1000);
            return days[date.getDay()] === dayName;
        });

        const total = dayLogs.reduce((acc, l) => acc + l.duration, 0) || 1;
        const productive = dayLogs.filter(l => l.activity_type === 'Productive').reduce((acc, l) => acc + l.duration, 0);
        const slow = dayLogs.filter(l => l.activity_type === 'Slow').reduce((acc, l) => acc + l.duration, 0);
        const notWorking = dayLogs.filter(l => l.activity_type === 'Not Working').reduce((acc, l) => acc + l.duration, 0);

        // If no data, show a small placeholder bar
        const hasData = dayLogs.length > 0;
        
        return {
            day: dayName,
            productive: hasData ? (productive / total) * 100 : 0,
            slow: hasData ? (slow / total) * 100 : 0,
            notWorking: hasData ? (notWorking / total) * 100 : 5, // Small grey bar for no data
            hasData
        };
    });
  };

  const dashboardData = processData();

  return (
    <Box p="xl">
      <Flex justify="space-between" align="flex-end" mb="2xl">
        <Stack gap="xs">
          <Title order={2} fw={700} fz="md" c="gray.1" style={{ letterSpacing: '0.05em' }}>
            Productivity Trends
          </Title>
          <Text fz="xs" fw={700} c="gray.6" style={{ letterSpacing: '0.1em' }}>
            LAST 7 DAYS PERFORMANCE
          </Text>
        </Stack>

        <Flex gap="xl">
          <Flex align="center" gap={6}>
            <Box w={8} h={8} bg="teal.2" style={{ borderRadius: '2px' }} />
            <Text fz="10px" fw={700} c="gray.6" style={{ letterSpacing: '0.1em' }}>PRODUCTIVE</Text>
          </Flex>
          <Flex align="center" gap={6}>
            <Box w={8} h={8} bg="amber.2" style={{ borderRadius: '2px' }} />
            <Text fz="10px" fw={700} c="gray.6" style={{ letterSpacing: '0.1em' }}>SLOW</Text>
          </Flex>
          <Flex align="center" gap={6}>
            <Box w={8} h={8} bg="dark.2" style={{ borderRadius: '2px' }} />
            <Text fz="10px" fw={700} c="gray.6" style={{ letterSpacing: '0.1em' }}>NOT WORKING</Text>
          </Flex>
        </Flex>
      </Flex>

      <Flex align="flex-end" justify="space-between" h={300} mb="xl">
        {dashboardData.map((d, i) => (
          <Flex key={i} direction="column" align="center" gap="md" flex={1}>
            <Box w={60} h={250} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
              <Box 
                h={`${d.notWorking}%`} 
                bg="dark.4" 
                style={{ position: 'absolute', bottom: `${d.slow + d.productive}%`, width: '100%' }} 
              />
              <Box 
                h={`${d.slow}%`} 
                bg="amber.2" 
                style={{ position: 'absolute', bottom: `${d.productive}%`, width: '100%', opacity: 0.8 }} 
              />
              <Box 
                h={`${d.productive}%`} 
                bg="teal.2" 
                style={{ position: 'absolute', bottom: 0, width: '100%' }} 
              />
            </Box>
            <Text fz="xs" fw={700} c={d.hasData ? "gray.1" : "gray.6"}>{d.day}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
