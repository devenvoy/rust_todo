import {
  MantineProvider,
  Box,
  Flex,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { precisionNoirTheme } from './theme';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import WorkstreamView from './components/WorkstreamView';
import DashboardView from './components/DashboardView';
import ChatView from './components/ChatView';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [activeView, setActiveView] = useState<'tasks' | 'dash' | 'chat'>('dash');
  const [activeTask, setActiveTask] = useState<any>(null);
  const [productivity, setProductivity] = useState<string>('Productive');
  const [settingsOpened, setSettingsOpened] = useState(false);

  useEffect(() => {
    const init = async () => {
      await invoke('initialize_db');
    };
    init();

    // Listen for productivity updates from Rust
    const unlisten = listen('productivity-update', (event) => {
      setProductivity(event.payload as string);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <MantineProvider theme={precisionNoirTheme} defaultColorScheme="dark">
      <Box h="100vh" w="100vw" bg="dark.7" style={{ overflow: 'hidden' }}>
        <Flex h="100%" w="100%">
          {/* Left Navigation Rail */}
          <Sidebar 
            active={activeView} 
            onSelect={setActiveView} 
            onOpenSettings={() => setSettingsOpened(true)} 
          />

          <Flex direction="column" flex={1} style={{ position: 'relative' }}>
            {/* Persistent Top Bar */}
            <TopBar 
                activeTask={activeTask} 
                productivity={productivity} 
                onOpenSettings={() => setSettingsOpened(true)}
            />

            {/* Main Content Area: Split View */}
            <Flex flex={1} style={{ overflow: 'hidden' }}>
              {/* Left Side: Workstream (Always visible in split view or primary view) */}
              <Box 
                w={activeView === 'tasks' ? '100%' : '400px'} 
                bg="dark.7" 
                style={{ 
                    transition: 'width 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                    borderRight: activeView !== 'tasks' ? '1px solid rgba(72, 72, 72, 0.15)' : 'none'
                }}
              >
                <WorkstreamView onSelectTask={setActiveTask} activeTaskId={activeTask?.id} />
              </Box>

              {/* Right Side: Dashboard or Chat */}
              <Box flex={1} bg="dark.7" px="xl" py="lg" style={{ overflowY: 'auto' }}>
                {activeView === 'dash' && <DashboardView />}
                {activeView === 'chat' && <ChatView />}
              </Box>
            </Flex>
          </Flex>
        </Flex>
        
        <SettingsModal 
            opened={settingsOpened} 
            onClose={() => setSettingsOpened(false)} 
        />
      </Box>
    </MantineProvider>
  );
}
