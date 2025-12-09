import SimpleCard from '../components/shared/SimpleCard';
import { ThemedLayout } from '../components/shared/ThemedLayout';
import { useSystemTheme } from '../hooks/useSystemTheme';
import { getColors } from '../theme/colors';

export default function HomePage() {
  const theme = useSystemTheme();
  const colors = getColors(theme);

  return (
    <ThemedLayout>
      <div style={{ padding: '1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          Welcome to the Multi-PWA Demo
        </h1>
        <p style={{
          textAlign: 'center',
          maxWidth: '60ch',
          margin: '0 auto 2rem auto',
          color: colors.textSecondary
        }}>
          This is the main PWA. You can install it, or you can navigate to one of the sub-apps and install them independently.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}>
          <SimpleCard
            title="Beautiful Mind"
            description="An independent PWA with its own components, hooks, and scope."
            link="/beautifulmind"
          />
          <SimpleCard
            title="Games"
            description="Another independent PWA, kept separate from Beautiful Mind."
            link="/games"
          />
        </div>
      </div>
    </ThemedLayout>
  );
}
