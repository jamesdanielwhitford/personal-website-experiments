import { useBeautifulMindStore } from './stores/useBeautifulMindStore';
import NotesDemo from './components/NotesDemo';
import { SettingsPanel } from '../../components/shared/SettingsPanel';
import { ThemedLayout } from '../../components/shared/ThemedLayout';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { getColors } from '../../theme/colors';

export default function BeautifulMindPage() {
  const {
    isSettingsOpen,
    currentTab,
    searchQuery,
    toggleSettings,
    setCurrentTab,
    setSearchQuery,
  } = useBeautifulMindStore();

  const theme = useSystemTheme();
  const colors = getColors(theme);

  return (
    <ThemedLayout>
      <div style={{ padding: '1rem' }}>
        <h2>Welcome to Beautiful Mind</h2>
        <p style={{ color: colors.textSecondary }}>
          This is the main page for the Beautiful Mind PWA.
        </p>

        <div style={{
          marginTop: '2rem',
          border: `1px solid ${colors.border}`,
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: colors.surface
        }}>
          <h3>UI State Demo</h3>

          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={toggleSettings}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isSettingsOpen ? 'Close Settings' : 'Open Settings'}
            </button>
            {isSettingsOpen && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: colors.surfaceHover,
                borderRadius: '4px'
              }}>
                Settings panel is open!
              </div>
            )}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label>Tabs: </label>
            {(['home', 'explore', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontWeight: currentTab === tab ? 'bold' : 'normal',
                  background: currentTab === tab ? colors.primary : colors.surface,
                  color: currentTab === tab ? 'white' : colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.5rem',
                width: '300px',
                backgroundColor: colors.background,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '4px'
              }}
            />
            {searchQuery && <p>Searching for: "{searchQuery}"</p>}
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          border: `1px solid ${colors.border}`,
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: colors.surface
        }}>
          <NotesDemo />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>API Settings</h3>
          <SettingsPanel appScope="beautifulmind" appName="Beautiful Mind" />
        </div>
      </div>
    </ThemedLayout>
  );
}
