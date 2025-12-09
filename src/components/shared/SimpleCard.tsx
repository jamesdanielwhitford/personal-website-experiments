import { Link } from 'react-router-dom';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { getColors } from '../../theme/colors';

interface SimpleCardProps {
  title: string;
  description: string;
  link: string;
}

const SimpleCard = ({ title, description, link }: SimpleCardProps) => {
  const theme = useSystemTheme();
  const colors = getColors(theme);

  return (
    <Link
      to={link}
      style={{
        display: 'block',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '1.5rem',
        textDecoration: 'none',
        color: colors.text,
        backgroundColor: colors.surface,
        transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.surfaceHover;
        e.currentTarget.style.borderColor = colors.primary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.surface;
        e.currentTarget.style.borderColor = colors.border;
      }}
    >
      <h2 style={{ margin: '0 0 0.5rem 0' }}>{title} &rarr;</h2>
      <p style={{ margin: 0, color: colors.textSecondary }}>{description}</p>
    </Link>
  );
};

export default SimpleCard;
