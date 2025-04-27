'use client';

import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useState, useEffect, useRef } from 'react';
import { useHotkeys } from '@mantine/hooks';
import '@mantine/core/styles.css';
import { DesktopTaskManager } from './data/DesktopTodoRepoImpl';
import { invoke } from '@tauri-apps/api/core';
import { Todo } from './data/TodoRepository';
import TaskCard from './components/TaskCard';

export default function App() {
  const taskRepository = new DesktopTaskManager();

  const [tasks, setTasks] = useState(taskRepository?.getTasks());
  const [opened, setOpened] = useState(false);

  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('dark')

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }

  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  const taskTitleRef = useRef<HTMLInputElement>(null);
  const taskSummaryRef = useRef<HTMLInputElement>(null);

  const handleCreateTask = async () => {
    if (taskTitleRef.current && taskSummaryRef.current) {
      await taskRepository?.createTask(taskTitleRef.current.value, taskSummaryRef.current.value);
      console.log("stamp 1 ");
      loadTasks();
      console.log("stamp 2 ");
      taskTitleRef.current.value = '';
      taskSummaryRef.current.value = '';
    }
  };

  const handleDeleteTask = async (index: number) => {
    await taskRepository?.deleteTask(index);
    loadTasks();
  };

  const loadTasks = async () => {
    try {
      const fetchedTasks = await taskRepository?.getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleUpdateTask = async (todo: Todo) => {
    try {
      await taskRepository.updateTask(todo);
      loadTasks();
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  useEffect(() => {
    const dd = async () => {
      await invoke('initialize_db');
      loadTasks();
    }
    dd();
  }, []);

  return (
    <div className="App">
      {/* Modal to create a new task */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="New Task"
        centered
      >
        <TextInput
          mt="md"
          ref={taskTitleRef}
          label="Title"
          placeholder="Task title"
          required
        />
        <TextInput
          mt="md"
          ref={taskSummaryRef}
          label="Summary"
          placeholder="Task summary"
        />
        <Group mt="md" justify="space-between">
          <Button variant="light" onClick={() => setOpened(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            handleCreateTask();
            setOpened(false);
          }}>
            Create Task
          </Button>
        </Group>
      </Modal>

      {/* Main Container */}
      <Container size="sm" py="lg">
        <Group justify="space-between">
          <Title order={2} fw={900}>
            My Tasks
          </Title>
          <ActionIcon
            size="lg"
            color="blue"
            variant="gradient"
            onClick={() => toggleColorScheme()}
          >
            {computedColorScheme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </ActionIcon>
        </Group>

        {tasks?.length ? (
          tasks.map((task, index) => (
            <TaskCard
              key={index}
              task={task}
              index={index}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
            />
          ))
        ) : (
          <Text size="lg" mt="md" c="dimmed">You have no tasks.</Text>
        )}

        {/* Button to open create modal */}
        <Button fullWidth mt="lg" onClick={() => setOpened(true)}>
          New Task
        </Button>
      </Container>
    </div>
  );
}
