import { useGamesStore } from './stores/useGamesStore';
import TodosDemo from './components/TodosDemo';

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

  const games = ['Chess', 'Checkers', 'Tic-Tac-Toe'];

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Welcome to Games</h2>
      <p>This is the main page for the Games PWA. It has its own separate Zustand store.</p>

      <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        <h3>UI State Demo</h3>

        <div style={{ marginTop: '1rem' }}>
          <button onClick={toggleMenu}>
            {isMenuOpen ? 'Hide Menu' : 'Show Menu'}
          </button>
          {isMenuOpen && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
              <strong>Game Menu</strong>
              <ul>
                {games.map((game) => (
                  <li key={game} style={{ cursor: 'pointer' }} onClick={() => setSelectedGame(game)}>
                    {game}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {selectedGame && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#e6f7ff', borderRadius: '4px' }}>
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
                fontWeight: difficulty === level ? 'bold' : 'normal',
                background: difficulty === level ? '#e24a90' : '#f0f0f0',
                color: difficulty === level ? 'white' : 'black',
              }}
            >
              {level}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button onClick={toggleSound}>
            {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        <TodosDemo />
      </div>
    </div>
  );
}
