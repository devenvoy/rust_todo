import { Flex, Text, Group, ActionIcon, Badge } from '@mantine/core';
import { PauseIcon, GearIcon, TimerIcon } from '@radix-ui/react-icons';
import { useState, useEffect } from 'react';

interface TopBarProps {
  activeTask?: any;
  productivity: string;
  onOpenSettings: () => void;
}

export default function TopBar({ activeTask, productivity, onOpenSettings }: TopBarProps) {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!activeTask || isPaused) return;

    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTask, isPaused]);

  // Reset timer when activeTask changes to a new one
  useEffect(() => {
    if (activeTask) {
      setSeconds(0);
      setIsPaused(false);
    }
  }, [activeTask?.id]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <Flex 
      h={60} 
      px="xl" 
      align="center" 
      justify="space-between" 
      bg="dark.7" 
      style={{ 
        borderBottom: '1px solid rgba(72, 72, 72, 0.15)',
        zIndex: 5
      }}
    >
      <Group gap="xl">
        <Text fw={700} fz="sm" c="gray.1" style={{ letterSpacing: '0.1em' }}>
          OBSIDIUS
        </Text>
        
        <Flex align="center" gap="sm">
            <Text c="gray.6" fz="xs" fw={500} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {activeTask ? 'ACTIVE TASK' : 'IDLE SESSION'}
            </Text>
            <Text fz="lg" fw={700} c={activeTask ? 'violet.2' : 'gray.6'} style={{ fontFamily: 'monospace' }}>
                {formatTime(seconds)}
            </Text>
        </Flex>

        {activeTask && (
            <Flex align="center" gap="sm">
                <Text c="gray.2" fz="xs" fw={400} style={{ opacity: 0.6 }}>|</Text>
                <Text c="gray.1" fz="sm" fw={600}>
                    {activeTask.title}
                </Text>
            </Flex>
        )}
      </Group>

      <Group gap="md">
        <Badge 
          color={productivity === 'Productive' ? 'teal.2' : productivity === 'Slow' ? 'amber.2' : 'gray.5'} 
          variant="light"
          radius="sm"
          size="sm"
        >
          {productivity.toUpperCase()}
        </Badge>
        
        <ActionIcon 
            variant="subtle" 
            color={activeTask && !isPaused ? 'violet' : 'gray'}
            onClick={() => activeTask && setIsPaused(!isPaused)}
        >
          {isPaused ? <TimerIcon /> : <PauseIcon />}
        </ActionIcon>
        
        <ActionIcon variant="subtle" color="gray" onClick={onOpenSettings}>
          <GearIcon />
        </ActionIcon>
      </Group>
    </Flex>
  );
}
