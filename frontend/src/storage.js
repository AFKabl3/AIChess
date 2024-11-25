const store = (key, value) => {
  const storage = JSON.parse(localStorage.getItem('chess-storage')) || {};
  storage[key] = value;
  localStorage.setItem('chess-storage', JSON.stringify(storage));
};

const read = (key) => {
  const storage = JSON.parse(localStorage.getItem('chess-storage')) || {};
  if (storage[key] === undefined) return null;

  return storage[key];
};

const readAndParse = (key, type) => {
  const value = read(key);
  if (value === null) return null;

  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true';
    case 'string':
      return String(value);
    default:
      return value;
  }
};

export const storage = {
  store,
  read,
  readAndParse,
};
