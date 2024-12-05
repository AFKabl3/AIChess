import { useState } from 'react';
import { storage } from '../storage';

// Default configuration
const defaultConfig = {
  SKILL_LEVEL: 2, // Default skill level for the chess bot
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

  const updateConfigValue = (key, value) => {
    if (typeof defaultConfig[key] !== typeof value) {
      throw new TypeError(`Type of ${key} must be ${typeof defaultConfig[key]}`);
    }

    storage.store(key, value);

    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  return [config, updateConfigValue];
};
