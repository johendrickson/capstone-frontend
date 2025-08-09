import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FooterBanner from '../components/FooterBanner';
import HeadingWithSvg from '../components/HeadingWithSvg';
import Header from '../components/Header';
import '../styles/CreateAccount.css';
import { API_BASE_URL } from '../constants/api';

function CreateAccountPage() {
  const navigate = useNavigate();

  // Update formData keys to match backend keys exactly
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    zip_code: '',
    garden_name: 'Your Garden',
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.details || 'Something went wrong.');
        return;
      }

      const user = data.user;

      // Save user ID to localStorage
      localStorage.setItem('plantpal_user_id', user.id);
      localStorage.setItem('plantpal_zip_code', user.zip_code);
      localStorage.setItem('plantpal_user_name', user.name);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating account:', error);
      setErrorMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="CreateAccountPage page">
      <Header />

      <main>
        <HeadingWithSvg text="Create your account" />

        <form onSubmit={handleSubmit}>
          <div className="fields">
            <label htmlFor="new-account-name">Name</label>
            <input
              id="new-account-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="new-account-email">E-mail</label>
            <input
              id="new-account-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="new-account-zip-code">Zip code</label>
            <input
              id="new-account-zip-code"
              name="zip_code"
              type="text"
              value={formData.zip_code}
              onChange={handleChange}
              required
            />

            <label htmlFor="new-account-garden-name">Garden name</label>
            <input
              id="new-account-garden-name"
              name="garden_name"
              type="text"
              value={formData.garden_name}
              onChange={handleChange}
              placeholder="Your Garden"
            />
          </div>

          {errorMessage && <p className="error">{errorMessage}</p>}

          <div className="submit-button">
            <input type="submit" value="Create" />
          </div>
        </form>
      </main>

      <FooterBanner />
    </div>
  );
}

export default CreateAccountPage;
