import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import HeadingWithSvg from '../components/HeadingWithSvg';
import FooterBanner from '../components/FooterBanner';
import '../styles/WeatherAlerts.css';

const weatherAlertIcon = '/assets/snow.svg';

export default function WeatherAlerts() {
  const [zipCode, setZipCode] = useState<string | null>(localStorage.getItem('plantpal_zip_code'));

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'plantpal_zip_code') {
        setZipCode(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // You can later add fetching weather alerts using zipCode here

  return (
    <div className="weather-alerts-page">
      <Header displaysPlantPalIcon={true} />
      <main>
        <HeadingWithSvg text="Weather Alerts" />
        <p>
          Stay informed about weather conditions that may affect your plants.
        </p>
        <p>Current zip code: {zipCode || 'Not set'}</p>
        <img src={weatherAlertIcon} alt="Weather Alert Icon" className="weather-alert-icon" />
      </main>
      <FooterBanner />
    </div>
  );
}
