import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import About from './pages/About';
import CreateAccount from './pages/CreateAccount';
import Login from './pages/Login';
import GettingStarted from './pages/GettingStarted';
import Dashboard from './pages/Dashboard';
import AddPlant from './pages/AddPlant';
import EditPlant from './pages/EditPlant';
import WateringReminders from './pages/WateringReminders';
import WeatherAlerts from './pages/WeatherAlerts';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/login" element={<Login />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plants/add" element={<AddPlant />} />
          <Route path="/plants/:id/edit" element={<EditPlant />} />
          <Route path="/watering-reminders" element={<WateringReminders />} />
          <Route path="/weather-alerts" element={<WeatherAlerts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
