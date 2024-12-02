import React, { useContext } from 'react';
import { ChessContext } from '../../pages/ChessPage/ChessContext';

const ColorSelection = () => {
  const { config, updateConfigValue } = useContext(ChessContext);

  const handleSelection = (color) => {
    updateConfigValue('selectedColor', color);
    updateConfigValue('startedGame', true);
  };

  return (
    <div>
      <h1>Select Your Color:</h1>
      <button 
        onClick={() => handleSelection('w')} 
        style={{ backgroundColor: config.selectedColor === 'w' ? 'lightgray' : '' }}
      >
        White
      </button>
      <button 
        onClick={() => handleSelection('b')} 
        style={{ backgroundColor: config.selectedColor === 'b' ? 'lightgray' : '' }}
      >
        Black
      </button>
    </div>
  );
};

export default ColorSelection;