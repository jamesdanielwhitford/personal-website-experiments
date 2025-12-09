import React, { useState, useEffect, useCallback } from 'react';
import { settingsFS, type UserSettings, type AppScope } from '../../fs/settingsFS';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { getColors } from '../../theme/colors';
import StoragePicker from './StoragePicker';

interface SettingsPanelProps {
  appScope: AppScope;
  appName: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ appScope, appName }) => {
  const theme = useSystemTheme();
  const colors = getColors(theme);

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('openai');
  const [apiEndpoint, setApiEndpoint] = useState('');

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const loadSettings = useCallback(async () => {
    if (!isConnected) return;
    const data = await settingsFS.getSettings(appScope);
    setSettings(data);

    if (data) {
      setApiKey(data.apiKey);
      setApiProvider(data.apiProvider);
      setApiEndpoint(data.apiEndpoint || '');
    }
  }, [appScope, isConnected]);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await settingsFS.isConnected();
      setIsConnected(connected);
    };
    checkConnection();
  }, []);

  // Load settings when connected
  useEffect(() => {
    if (isConnected) {
      loadSettings();
    }
  }, [isConnected, loadSettings]);

  const handleConnected = () => {
    setIsConnected(true);
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    setSettings(null);
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('API Key is required');
      return;
    }

    setSaveStatus('saving');

    try {
      await settingsFS.saveSettings(
        appScope,
        apiKey.trim(),
        apiProvider,
        apiEndpoint.trim() || undefined
      );

      setSaveStatus('saved');
      setIsEditing(false);
      await loadSettings();

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your API key? This cannot be undone.')) {
      return;
    }

    try {
      await settingsFS.deleteSettings(appScope);
      setSettings(null);
      setApiKey('');
      setApiProvider('openai');
      setApiEndpoint('');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to delete settings:', error);
      alert('Failed to delete settings');
    }
  };

  const handleCancel = () => {
    if (settings) {
      setApiKey(settings.apiKey);
      setApiProvider(settings.apiProvider);
      setApiEndpoint(settings.apiEndpoint || '');
    }
    setIsEditing(false);
  };

  return (
    <div style={{
      padding: '1.5rem',
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      maxWidth: '600px',
      backgroundColor: colors.surface
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        {appName} Settings
      </h3>

      <div style={{
        padding: '1rem',
        backgroundColor: colors.warningBg,
        border: `1px solid ${colors.warningBorder}`,
        borderRadius: '4px',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        color: colors.text
      }}>
        <strong>Privacy Notice:</strong> Your API key is stored as a local file in your selected folder.
        It never leaves your device and is not sent to any server. You are responsible for keeping
        your API key secure.
      </div>

      <StoragePicker onConnected={handleConnected} onDisconnected={handleDisconnected} />

      {isConnected && (
        <>
          {!isEditing && settings ? (
            // View Mode
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <strong>API Provider:</strong> {settings.apiProvider}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>API Key:</strong>{' '}
                <span style={{ fontFamily: 'monospace' }}>
                  {showApiKey
                    ? settings.apiKey
                    : '•'.repeat(Math.min(settings.apiKey.length, 32))
                  }
                </span>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    backgroundColor: colors.surface,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px'
                  }}
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>

              {settings.apiEndpoint && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong>API Endpoint:</strong> {settings.apiEndpoint}
                </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Edit Settings
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: colors.error,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete API Key
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                  API Provider
                </label>
                <select
                  value={apiProvider}
                  onChange={(e) => setApiProvider(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                  API Key *
                </label>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: `1px solid ${colors.border}`,
                    fontFamily: 'monospace',
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                />
                <label style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.85rem', color: colors.textSecondary }}>
                  <input
                    type="checkbox"
                    checked={showApiKey}
                    onChange={(e) => setShowApiKey(e.target.checked)}
                  />
                  {' '}Show API key
                </label>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                  API Endpoint (Optional)
                </label>
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: `1px solid ${colors.border}`,
                    fontFamily: 'monospace',
                    backgroundColor: colors.background,
                    color: colors.text
                  }}
                />
                <small style={{ color: colors.textSecondary }}>
                  Leave blank to use default endpoint
                </small>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: saveStatus === 'saved' ? colors.success : colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saveStatus === 'saving' ? 'Saving...' :
                   saveStatus === 'saved' ? 'Saved!' :
                   'Save Settings'}
                </button>

                {settings && (
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: colors.surface,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {saveStatus === 'error' && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: colors.errorBg,
                  border: `1px solid ${colors.errorBorder}`,
                  borderRadius: '4px',
                  color: colors.error
                }}>
                  Failed to save settings. Please try again.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
