import { storage } from './storage';
const handler = {
  set(target, property, value) {
    // Check if the type of the new value matches the type of the existing value
    if (typeof target[property] !== typeof value) {
      throw new TypeError(`Type of ${property} must be ${typeof target[property]}`);
    }

    console.log(`Config property ${property} set to ${value}`);
    storage.store(property, value);
    target[property] = value;

    return true;
  },
};

// Default configuration
const defaultConfig = {
  depth: 2, // Default depth for the chess bot
};

// Create a Proxy to handle configuration changes
export const config = new Proxy(defaultConfig, handler);

// Load stored configuration values from storage if they exist
Object.keys(defaultConfig).forEach((key) => {
  if (storage.read(key)) {
    const storedValue = storage.readAndParse(key, typeof defaultConfig[key]);
    if (storedValue !== null) {
      config[key] = storedValue;
    }
  }
});
