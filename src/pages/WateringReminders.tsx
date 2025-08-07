import React from 'react';
import Header from '../components/Header';
import HeadingWithSvg from '../components/HeadingWithSvg';
import InfoText from '../components/InfoText';
import FooterBanner from '../components/FooterBanner';
import '../styles/WateringReminders.css';

const wateringCanIcon = '/assets/watering-can.svg';

export default function WateringReminders() {
  return (
    <div className="watering-reminders-page">
      <Header displaysPlantPalIcon={true} />
      <main>
        <HeadingWithSvg text="Watering Reminders" />
        <p>
          Set up reminders to keep your plants hydrated and healthy.
        </p>
        <img src={wateringCanIcon} alt="Watering Can Icon" className="watering-can-icon" />
        {/* Additional content for watering reminders can be added here */}
      </main>
      <FooterBanner />
    </div>
  );
}