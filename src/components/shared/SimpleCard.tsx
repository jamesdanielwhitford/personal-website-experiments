import { Link } from 'react-router-dom';

interface SimpleCardProps {
  title: string;
  description: string;
  link: string;
}

const SimpleCard = ({ title, description, link }: SimpleCardProps) => {
  return (
    <Link to={link} style={{
      display: 'block',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '1.5rem',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      <h2 style={{ margin: '0 0 0.5rem 0' }}>{title} &rarr;</h2>
      <p style={{ margin: 0, opacity: 0.8 }}>{description}</p>
    </Link>
  );
};

export default SimpleCard;
