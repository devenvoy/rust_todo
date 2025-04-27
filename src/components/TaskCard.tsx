import { useState } from 'react';
import { Card, Checkbox, ActionIcon, Group, Text, Flex, Center } from '@mantine/core';
import { TrashIcon } from '@radix-ui/react-icons';
import { Todo } from '../data/TodoRepository';

interface TaskCardProps {
  task: Todo;
  index: number;
  onDelete: (index: number) => void;
  onUpdate: (updatedTask: Todo) => void;
}

const TaskCard = ({ task, index, onDelete, onUpdate }: TaskCardProps) => {
  const [isChecked, setChecked] = useState(task.done);

  const handleCheckboxChange = () => {
    setChecked(!isChecked);
    const updatedTask = { ...task, done: !isChecked };
    onUpdate(updatedTask);
  };

  return (
    <Card withBorder key={index} mt="sm" radius="md">
      <Group justify="space-between">
        <Text fw={600}>{task.title}</Text>
        <Flex justify='center' align='center' >
          <Checkbox checked={isChecked} mx={25} onChange={handleCheckboxChange} />
          <ActionIcon color="red" variant="light" onClick={() => onDelete(index)}>
            <TrashIcon />
          </ActionIcon>
        </Flex>
      </Group>
      <Text mt="xs" c="dimmed" size="sm">
        {task.summary || 'No summary was provided for this task.'}
      </Text>
    </Card>
  );
};

export default TaskCard;
