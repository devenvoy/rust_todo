import { Box, Flex, ActionIcon, Stack, Tooltip } from '@mantine/core';
import { 
  DashboardIcon, 
  CheckCircledIcon, 
  ChatBubbleIcon, 
  GearIcon,
  AvatarIcon,
  MagicWandIcon
} from '@radix-ui/react-icons';

interface SidebarProps {
  active: 'tasks' | 'dash' | 'chat';
  onSelect: (view: 'tasks' | 'dash' | 'chat') => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ active, onSelect, onOpenSettings }: SidebarProps) {
  return (
    <Box 
      w={80} 
      bg="dark.6" 
      h="100vh" 
      style={{ 
        borderRight: '1px solid rgba(72, 72, 72, 0.15)',
        zIndex: 10
      }}
    >
      <Flex direction="column" h="100%" py="xl" align="center" justify="space-between">
        <Stack gap="xl">
          <ActionIcon 
            size="xl" 
            variant="light" 
            color="violet" 
            radius="md" 
            style={{ marginBottom: '20px' }}
          >
            <MagicWandIcon style={{ width: '24px', height: '24px' }} />
          </ActionIcon>

          <Tooltip label="Dashboard" position="right">
            <ActionIcon 
              size="lg" 
              variant={active === 'dash' ? 'filled' : 'subtle'} 
              color={active === 'dash' ? 'violet' : 'gray'}
              onClick={() => onSelect('dash')}
            >
              <DashboardIcon />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Tasks" position="right">
            <ActionIcon 
              size="lg" 
              variant={active === 'tasks' ? 'filled' : 'subtle'} 
              color={active === 'tasks' ? 'violet' : 'gray'}
              onClick={() => onSelect('tasks')}
            >
              <CheckCircledIcon />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="AI Chat" position="right">
            <ActionIcon 
              size="lg" 
              variant={active === 'chat' ? 'filled' : 'subtle'} 
              color={active === 'chat' ? 'violet' : 'gray'}
              onClick={() => onSelect('chat')}
            >
              <ChatBubbleIcon />
            </ActionIcon>
          </Tooltip>
        </Stack>

        <Stack gap="md">
          <ActionIcon size="lg" variant="subtle" color="gray" onClick={onOpenSettings}>
            <GearIcon />
          </ActionIcon>
          <ActionIcon size="lg" variant="subtle" color="gray">
            <AvatarIcon />
          </ActionIcon>
        </Stack>
      </Flex>
    </Box>
  );
}
