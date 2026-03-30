import { Box, Flex, Text, Title, TextInput, Stack, Card, ActionIcon, Collapse, Group } from '@mantine/core';
import { ChevronDownIcon, ChevronRightIcon, PlayIcon, PauseIcon, MagicWandIcon, CheckIcon } from '@radix-ui/react-icons';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface WorkstreamViewProps {
  onSelectTask: (task: any) => void;
  activeTaskId?: number;
}

export default function WorkstreamView({ onSelectTask, activeTaskId }: WorkstreamViewProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [objective, setObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const loadTasks = async () => {
    const fetchedTasks = await invoke('load') as any[];
    setTasks(fetchedTasks);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const [manualTitle, setManualTitle] = useState('');

  const handleManualAdd = async (e?: React.KeyboardEvent) => {
    if ((!e || e.key === 'Enter') && manualTitle.trim()) {
      const now = Math.floor(Date.now() / 1000);
      const newTask = {
        title: manualTitle,
        summary: '',
        status: 'BACKLOG',
        done: false,
        created_at: now,
        updated_at: now,
      };
      await invoke('upsert', { todo: newTask });
      setManualTitle('');
      loadTasks();
    }
  };

  const handleAIStart = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && objective.trim()) {
      setLoading(true);
      try {
        const subtasks = await invoke('generate_subtasks', { objective }) as any[];
        for (const task of subtasks) {
          await invoke('upsert', { todo: task });
        }
        setObjective('');
        loadTasks();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'teal.2';
      case 'CRITICAL': return 'red.7';
      case 'DONE': return 'gray.5';
      default: return 'gray.6';
    }
  };

  return (
    <Box p="xl" h="100%" style={{ overflowY: 'auto' }}>
      <Flex justify="space-between" align="center" mb="xl">
        <Title order={2} fw={700} fz="h1" c="gray.1">
            Workstream
        </Title>
      </Flex>

      <Stack gap="xs" mb="2xl">
        <TextInput
            placeholder="Quick add task..."
            value={manualTitle}
            onChange={(e) => setManualTitle(e.currentTarget.value)}
            onKeyDown={handleManualAdd}
            size="md"
            rightSection={
                <ActionIcon variant="subtle" color="gray" onClick={() => handleManualAdd()}>
                    <CheckIcon />
                </ActionIcon>
            }
            styles={{
                input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px'
                }
            }}
        />
        <Text fz="10px" fw={700} c="gray.6" ta="center" style={{ letterSpacing: '0.1em' }}>OR USE AI DECOMPOSITION</Text>
        <TextInput
            placeholder="Tell the AI what you want to achieve..."
            leftSection={<MagicWandIcon color="#dab9ff" />}
            value={objective}
            onChange={(e) => setObjective(e.currentTarget.value)}
            onKeyDown={handleAIStart}
            disabled={loading}
            size="md"
            styles={{
                input: {
                    backgroundColor: 'rgba(218, 185, 255, 0.05)',
                    border: '1px solid rgba(218, 185, 255, 0.1)',
                    borderRadius: '12px'
                }
            }}
        />
      </Stack>

      <Stack gap="md">
        {tasks.filter(t => !t.parent_id).map((task) => (
          <Card key={task.id} p="lg" bg="dark.4" radius="lg" style={{ cursor: 'pointer' }} onClick={() => onSelectTask(task)}>
            <Flex align="center" gap="md">
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => toggleExpand(task.id)}>
                {expanded[task.id] ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </ActionIcon>
              
              <Stack gap={0} flex={1}>
                <Text fw={700} c="gray.1" fz="md">{task.title}</Text>
                <Group gap="xs" mt={4}>
                    <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: getStatusColor(task.status) }} />
                    <Text fz="xs" fw={700} c="gray.6" style={{ letterSpacing: '0.05em' }}>{task.status}</Text>
                </Group>
              </Stack>

              <ActionIcon variant="subtle" size="lg" color="gray">
                {activeTaskId === task.id ? <PauseIcon /> : <PlayIcon />}
              </ActionIcon>
            </Flex>

            <Collapse in={expanded[task.id]}>
                <Stack mt="md" pl="xl" gap="sm">
                    {tasks.filter(t => t.parent_id === task.id).map(sub => (
                        <Flex key={sub.id} align="center" gap="sm">
                            {sub.done ? <CheckIcon color="#43aea4" /> : <Box w={16} h={16} style={{ 
                                border: '1.5px solid rgba(176, 173, 173, 0.4)', 
                                borderRadius: '50%' 
                            }} />}
                            <Text fz="sm" c="gray.4">{sub.title}</Text>
                        </Flex>
                    ))}
                </Stack>
            </Collapse>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
