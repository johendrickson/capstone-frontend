import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import HeadingWithSvg from '../components/HeadingWithSvg';
import FooterBanner from '../components/FooterBanner';
import '../styles/WeatherAlerts.css';
import axios from 'axios';
import { getUserProfile } from '../api/users';
import { API_BASE_URL } from '../constants/api';

const weatherAlertIcon = '/assets/snow.svg';

export default function WeatherAlerts() {
  const userId = Number(localStorage.getItem("plantpal_user_id"));
  const [zipCode, setZipCode] = useState<string | null>(localStorage.getItem('plantpal_zip_code'));
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plantpal_zip_code') {
        setZipCode(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!userId) return;

    getUserProfile(userId)
      .then((user) => {
        setAlertsEnabled(Boolean(user.weather_alerts_enabled));
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        setErrorMsg("Failed to load user info.");
      });
  }, [userId]);


  const handleToggle = () => {
    const newValue = !alertsEnabled;
    setAlertsEnabled(newValue);

    axios.patch(
      `${API_BASE_URL}/users/${userId}`,
      { weather_alerts_enabled: newValue },
      { withCredentials: true },
    )
      .catch(err => {
        console.error('Failed to update weather alert setting:', err);
      });
  };

  return (
    <div className="weather-alerts-page page">
      <Header displaysPlantPalIcon={true} />
      <main>
        <HeadingWithSvg text="Weather Alerts" />
        <p className='sentences'>Stay one step ahead of the weather so your plants can thrive.</p>
        <p className='sentences'>
          When your zip code is forecasted for extreme conditions—like frost, heat waves, cold snaps, or dry heat—you’ll get an email alert with enough time to protect your plants.
          These alerts are based on daily forecasts and local weather data.
        </p>
        <p className='zip'>Current zip code: {zipCode || 'Not set'}</p>

        <div className="alert-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={handleToggle}
            />
            <span className="slider" />
          </label>
          <span className="toggle-label">{alertsEnabled ? 'Opted in' : 'Opted out'}</span>
        </div>

        {
          errorMsg && (
            <div>
              {errorMsg}
            </div>
          )
        }

        <p className="email-note">
          Alerts will be sent to the email address linked to your account.
        </p>

        <img src={weatherAlertIcon} alt="Weather Alert Icon" className="weather-alert-icon" />
      </main>
      <FooterBanner />
    </div>
  );
}