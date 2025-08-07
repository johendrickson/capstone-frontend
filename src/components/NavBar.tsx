import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';

interface NavBarProps {
  links: { path: string; label: string }[];
}

export default function NavBar({ links }: NavBarProps) {
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="nav-box">
      {links.map(link => (
        link.path === '/logout' ? (
          <a key={link.path} href="/" onClick={handleLogout} className="nav-link">
            {link.label}
          </a>
        ) : (
          <Link key={link.path} to={link.path} className="nav-link">
            {link.label}
          </Link>
        )
      ))}
    </nav>
  );
}
