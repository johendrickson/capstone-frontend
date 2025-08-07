import NavBar from './NavBar';
import logo from '../assets/logo.svg';
import { useLocation, Link } from 'react-router-dom';
import '../styles/Header.css';
import path from 'path';

function Header({ displaysPlantPalIcon = true }) {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("plantpal_user_id");
  const currentPath = location.pathname;

  let navLinks;

  if (currentPath === '/login') {
    // On login page
    navLinks = [
      { path: '/', label: 'Home' },
      { path: '/getting-started', label: 'Getting Started' },
      { path: '/about', label: 'About' },
    ];
  } else if (currentPath === '/' && isLoggedIn) {
    // Home page, user logged in
    navLinks = [
      { path: '/getting-started', label: 'Getting Started' },
      { path: '/about', label: 'About' },
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/logout', label: 'Logout' },
    ];
  } else if (currentPath === '/') {
    // Home page, not logged in
    navLinks = [
      { path: '/getting-started', label: 'Getting Started' },
      { path: '/about', label: 'About' },
      { path: '/login', label: 'Login' },
    ];
  } else if (isLoggedIn) {
    // Any other logged-in page (e.g., dashboard/settings/etc)
    navLinks = [
      { path: '/', label: 'Home' },
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/watering-reminders', label: 'Watering Reminders' },
      { path: '/weather-alerts', label: 'Weather Alerts' },
      { path: '/settings', label: 'Settings' },
      { path: '/logout', label: 'Logout' },
    ];
  } else {
    // Fallback for any other page (not logged in)
    navLinks = [
      { path: '/', label: 'Home' },
      { path: '/getting-started', label: 'Getting Started' },
      { path: '/about', label: 'About' },
    ];
  }

  const filteredLinks = navLinks.filter(link => link.path !== currentPath);

  return (
    <header className={`App-header ${displaysPlantPalIcon ? '' : 'no-icon'}`}>
      {displaysPlantPalIcon && (
        <Link to='/'>
          <div className="site-logo-and-name">
            <img
              src={logo}
              className="App-logo"
              alt="main logo"
            />
            <span>Plant Pal</span>
          </div>
        </Link>
      )}
      <NavBar links={filteredLinks} />
    </header>
  );
}

export default Header;
