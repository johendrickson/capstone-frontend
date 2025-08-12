import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FooterBanner from '../components/FooterBanner';
import Header from '../components/Header';
import HeadingWithSvg from '../components/HeadingWithSvg';
import '../styles/Login.css';
import { API_BASE_URL } from '../constants/api';

  const backgroundUrl = '/assets/sunny_far_flowers.jpg';
  const bgImgStyles = { backgroundImage: `url(${backgroundUrl})` };

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.details || 'Login failed.');
        return;
      }

      const user = data.user;

      localStorage.setItem('plantpal_user_id', user.id);
      localStorage.setItem('plantpal_zip_code', user.zip_code);
      localStorage.setItem('plantpal_user_name', user.name);

      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('Network error. Please try again.');
    }
  };

  return (
    <div style={bgImgStyles} className='LoginPage page'>
      <Header />

      <main>
        <div>
          <div className='white-bg'>
            <HeadingWithSvg text='Login to Your Account' />

            <form onSubmit={handleSubmit}>
              <div className='fields'>
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder='your_email@something.com'
                  value={email}
                  onChange={handleChange}
                  required
                />
              </div>

              {errorMessage && <p className="error">{errorMessage}</p>}

              <div className='login-or-create'>
                <input type="submit" value="Sign In" />
                <span>or</span>
                <a href="/create-account">Create an account</a>
              </div>
            </form>
          </div>
        </div>
      </main>

      <FooterBanner />
    </div>
  );
}

export default LoginPage;
