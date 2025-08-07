import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  zipCode: string | null;
  setZipCode: (zip: string) => void;
  lat: number | null;
  lon: number | null;
  setLatLon: (lat: number, lon: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zipCode, setZipCodeState] = useState<string | null>(() => localStorage.getItem("plantpal_zip_code"));
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  const setZipCode = (zip: string) => {
    localStorage.setItem("plantpal_zip_code", zip);
    setZipCodeState(zip);
  };

  const setLatLon = (lat: number, lon: number) => {
    setLat(lat);
    setLon(lon);
  };

  return (
    <UserContext.Provider value={{ zipCode, setZipCode, lat, lon, setLatLon }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
