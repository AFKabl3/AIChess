import { useState } from 'react';
import { storage } from '../storage';

// Default configuration
export const defaultConfig = {
  SKILL_LEVEL: 2, // Default skill level for the chess bot
  selectedColor: 'w', // Default color used by the user
  startedGame: false,
  fullControlMode: false,
  turn: 'w',
};

export const useConfig = () => {
  const [config, setConfig] = useState(() => {
    const initialConfig = { ...defaultConfig };

    Object.keys(defaultConfig).forEach((key) => {
      const storedValue = storage.readAndParse(key, typeof defaultConfig[key]);
      if (storedValue !== null) {
        initialConfig[key] = storedValue;
      }
    });

    return initialConfig;
  });

  const setConfigValue = (key, value) => {
    if (typeof defaultConfig[key] !== typeof value) {
      throw new TypeError(`Type of ${key} must be ${typeof defaultConfig[key]}`);
    }

    storage.store(key, value);

    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  return [config, setConfigValue];
};
