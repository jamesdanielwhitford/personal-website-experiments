import React, { useState, useEffect } from 'react';
import { settingsService } from '../../db/settingsService';
import type { UserSettings } from '../../db/database';

type AppScope = 'beautifulmind' | 'games' | 'root';

interface SettingsPanelProps {
  appScope: AppScope;
  appName: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ appScope, appName }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('openai');
  const [apiEndpoint, setApiEndpoint] = useState('');

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [appScope]);

  const loadSettings = async () => {
    const data = await settingsService.getSettings(appScope);
    setSettings(data || null);

    if (data) {
      setApiKey(data.apiKey);
      setApiProvider(data.apiProvider);
      setApiEndpoint(data.apiEndpoint || '');
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      alert('API Key is required');
      return;
    }

    setSaveStatus('saving');

    try {
      await settingsService.saveSettings(
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
      await settingsService.deleteSettings(appScope);
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
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      maxWidth: '600px',
      backgroundColor: '#fafafa'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        {appName} Settings
      </h3>

      <div style={{
        padding: '1rem',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        fontSize: '0.9rem'
      }}>
        <strong>🔒 Privacy Notice:</strong> Your API key is stored locally in your browser's IndexedDB.
        It never leaves your device and is not sent to any server. You are responsible for keeping
        your API key secure.
      </div>

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
                cursor: 'pointer'
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
                backgroundColor: '#007bff',
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
                backgroundColor: '#dc3545',
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
                border: '1px solid #ccc'
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
                border: '1px solid #ccc',
                fontFamily: 'monospace'
              }}
            />
            <label style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.85rem' }}>
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
                border: '1px solid #ccc',
                fontFamily: 'monospace'
              }}
            />
            <small style={{ color: '#666' }}>
              Leave blank to use default endpoint
            </small>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: saveStatus === 'saved' ? '#28a745' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer'
              }}
            >
              {saveStatus === 'saving' ? 'Saving...' :
               saveStatus === 'saved' ? '✓ Saved!' :
               'Save Settings'}
            </button>

            {settings && (
              <button
                onClick={handleCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
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
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              color: '#721c24'
            }}>
              Failed to save settings. Please try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
