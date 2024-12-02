import React, { useState, useEffect } from 'react';
import { useConfig } from '../../hooks/useConfig';

const ColorSelection = ({ startedGame, setStartedGame }) => {
  const [config, updateConfigValue] = useConfig();

  const handleSelection = (color) => {
    updateConfigValue('selectedColor', color);
    setStartedGame(true);
  };

  // debug
  useEffect(() => {
    console.log("ColorSelection config: ", config);
    console.log("ColorSelection startedGame:", startedGame);  
  }, [startedGame]);  
  

  return (
    <div>
      <h3>Select Your Color:</h3>
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