import { Modal, PasswordInput, Select, Button, Stack, Group, Text, ActionIcon } from '@mantine/core';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ReloadIcon } from '@radix-ui/react-icons';

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [provider, setProvider] = useState('openai');
  const [models, setModels] = useState<string[]>(['gpt-4o-mini', 'gpt-4o']);
  const [loading, setLoading] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);

  useEffect(() => {
    if (opened) {
      loadSettings();
    }
  }, [opened]);

  const loadSettings = async () => {
    try {
      const settings = await invoke('get_settings') as any;
      setApiKey(settings.ai_api_key);
      setModel(settings.ai_model);
      setProvider(settings.ai_provider);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleFetchModels = async () => {
    setFetchingModels(true);
    try {
      // Temporarily update settings so the backend has the key to fetch models
      await invoke('update_settings', { 
        settings: { ai_api_key: apiKey, ai_model: model, ai_provider: provider } 
      });
      const fetchedModels = await invoke('fetch_models') as string[];
      setModels(fetchedModels);
    } catch (err) {
      console.error('Failed to fetch models:', err);
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await invoke('update_settings', { 
        settings: { ai_api_key: apiKey, ai_model: model, ai_provider: provider } 
      });
      onClose();
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title="AI Configuration" 
      centered
      radius="lg"
      styles={{
        content: { backgroundColor: '#1A1B1E' },
        header: { backgroundColor: '#1A1B1E' }
      }}
    >
      <Stack gap="md">
        <Select
          label="AI Provider"
          placeholder="Select provider"
          data={[
            { value: 'openai', label: 'OpenAI' },
          ]}
          value={provider}
          onChange={(val) => setProvider(val || 'openai')}
        />

        <PasswordInput
          label="API Key"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.currentTarget.value)}
        />

        <Group align="flex-end" gap="xs">
          <Select
            label="Model"
            placeholder="Select model"
            data={models.map(m => ({ value: m, label: m }))}
            value={model}
            onChange={(val) => setModel(val || '')}
            flex={1}
          />
          <ActionIcon 
            variant="light" 
            color="violet" 
            size="lg" 
            onClick={handleFetchModels}
            loading={fetchingModels}
          >
            <ReloadIcon />
          </ActionIcon>
        </Group>

        <Text fz="xs" c="gray.6">
          The API key is stored locally in your database.
        </Text>

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
          <Button color="violet" onClick={handleSave} loading={loading}>Save Settings</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
