import { useGamesStore } from './stores/useGamesStore';
import TodosDemo from './components/TodosDemo';
import { SettingsPanel } from '../../components/shared/SettingsPanel';
import { ThemedLayout } from '../../components/shared/ThemedLayout';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { getColors } from '../../theme/colors';

export default function GamesPage() {
  const {
    selectedGame,
    isMenuOpen,
    difficulty,
    soundEnabled,
    setSelectedGame,
    toggleMenu,
    setDifficulty,
    toggleSound,
  } = useGamesStore();

  const theme = useSystemTheme();
  const colors = getColors(theme);

  const games = ['Chess', 'Checkers', 'Tic-Tac-Toe'];

  return (
    <ThemedLayout>
      <div style={{ padding: '1rem' }}>
        <h2>Welcome to Games</h2>
        <p style={{ color: colors.textSecondary }}>
          This is the main page for the Games PWA.
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
              onClick={toggleMenu}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isMenuOpen ? 'Hide Menu' : 'Show Menu'}
            </button>
            {isMenuOpen && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: colors.surfaceHover,
                borderRadius: '4px'
              }}>
                <strong>Game Menu</strong>
                <ul>
                  {games.map((game) => (
                    <li
                      key={game}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedGame(game)}
                    >
                      {game}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {selectedGame && (
            <div style={{
              marginTop: '1rem',
              padding: '0.5rem',
              background: colors.primary,
              color: 'white',
              borderRadius: '4px'
            }}>
              <strong>Selected Game:</strong> {selectedGame}
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <label>Difficulty: </label>
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontWeight: difficulty === level ? 'bold' : 'normal',
                  background: difficulty === level ? colors.primary : colors.surface,
                  color: difficulty === level ? 'white' : colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {level}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={toggleSound}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: soundEnabled ? colors.success : colors.surface,
                color: soundEnabled ? 'white' : colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          border: `1px solid ${colors.border}`,
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: colors.surface
        }}>
          <TodosDemo />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3>API Settings</h3>
          <SettingsPanel appScope="games" appName="Games" />
        </div>
      </div>
    </ThemedLayout>
  );
}
