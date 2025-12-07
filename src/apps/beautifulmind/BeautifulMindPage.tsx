import { useBeautifulMindStore } from './stores/useBeautifulMindStore';
import NotesDemo from './components/NotesDemo';

export default function BeautifulMindPage() {
  const {
    isDarkMode,
    isSettingsOpen,
    currentTab,
    searchQuery,
    toggleDarkMode,
    toggleSettings,
    setCurrentTab,
    setSearchQuery,
  } = useBeautifulMindStore();

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Welcome to Beautiful Mind</h2>
      <p>This is the main page for the Beautiful Mind PWA. It demonstrates Zustand state management.</p>

      <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        <h3>UI State Demo</h3>

        <div style={{ marginTop: '1rem' }}>
          <button onClick={toggleDarkMode}>
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <span style={{ marginLeft: '1rem' }}>Current: {isDarkMode ? 'Dark' : 'Light'}</span>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button onClick={toggleSettings}>
            {isSettingsOpen ? 'Close Settings' : 'Open Settings'}
          </button>
          {isSettingsOpen && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
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
                fontWeight: currentTab === tab ? 'bold' : 'normal',
                background: currentTab === tab ? '#646cff' : '#f0f0f0',
                color: currentTab === tab ? 'white' : 'black',
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
            style={{ padding: '0.5rem', width: '300px' }}
          />
          {searchQuery && <p>Searching for: "{searchQuery}"</p>}
        </div>
      </div>

      <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        <NotesDemo />
      </div>
    </div>
  );
}
