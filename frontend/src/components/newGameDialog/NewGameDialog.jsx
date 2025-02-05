import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const NewGameDialog = ({ onConfirm, open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1); // State for the current step the dialog is displaying
  const [previousStep, setPreviousStep] = useState(null);
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState(1);
  const [selectedSeconds, setSelectedSeconds] = useState(0);

  const resetDialogValues = () => {
    setCurrentStep(1);
    setSelectedMode('');
    setSelectedColor('');
    setSelectedMinutes(1);
    setSelectedSeconds(0);
  };

  useEffect(() => {
    if (open) {
      resetDialogValues();
    }
  }, [open]);

  // Handle navigation between steps
  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep === 3 && selectedMode === 'versus-bot') {
      setCurrentStep(previousStep); // Skip the time selection (go to mode selection)
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleConfirm = () => {
    const dialogData = {
      selectedMode,
      selectedColor: selectedColor || 'w', // Default to white if not selected
      selectedMinutes,
      selectedSeconds,
    };
    onConfirm(dialogData);
    onClose();
  };

  const handleSelectMode = (mode) => {
    setSelectedMode(mode);

    if (mode === 'full-control') {
      const dialogData = {
        selectedMode: mode,
        selectedColor, 
        selectedMinutes,
        selectedSeconds,
      };
      onConfirm(dialogData);
      onClose();
    } else if (mode === 'versus-bot') {
      setPreviousStep(1);
      setCurrentStep(3);
    } else if (mode === 'timed') {
      setCurrentStep(2); // Go to time selection
    }
  };

  // Content for each step of the dialog
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              '& button': {
                padding: '10px 20px',
                fontSize: '1rem',
              },
            }}
          >
            <Button variant="contained" onClick={() => handleSelectMode('versus-bot')}>
              Versus Bot
            </Button>

            <Button variant="contained" onClick={() => handleSelectMode('timed')}>
              Timed Mode
            </Button>
            <Box
              sx={{
                position: 'relative', // Position relative to allow absolute positioning of the tooltip
              }}
            >
              <Button variant="contained" onClick={() => handleSelectMode('full-control')}>
                Full Control Mode
              </Button>
              <Tooltip
                title="Play by controling both white and black pieces."
                PopperProps={{
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [-120, -5], // [horizontal offset, vertical offset]
                      },
                    },
                  ],
                }}
              >
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: -50,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Select Time Per Player:</Typography>
            <Select value={selectedMinutes} onChange={(e) => setSelectedMinutes(e.target.value)}>
              <MenuItem value={1}>1 Minute</MenuItem>
              <MenuItem value={2}>2 Minutes</MenuItem>
              <MenuItem value={3}>3 Minutes</MenuItem>
              <MenuItem value={5}>5 Minutes</MenuItem>
              <MenuItem value={10}>10 Minutes</MenuItem>
            </Select>
            <Typography>Select Increment Per Move:</Typography>
            <Select value={selectedSeconds} onChange={(e) => setSelectedSeconds(e.target.value)}>
              <MenuItem value={0}>0 Seconds</MenuItem>
              <MenuItem value={2}>2 Seconds</MenuItem>
              <MenuItem value={3}>3 Seconds</MenuItem>
              <MenuItem value={5}>5 Seconds</MenuItem>
              <MenuItem value={10}>10 Seconds</MenuItem>
            </Select>
          </Box>
        );

      case 3:
        return (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Button
              variant="contained"
              onClick={() => setSelectedColor('w')}
              sx={{
                backgroundColor: selectedColor === 'w' ? '#e0e0e0' : 'white',
                color: 'black',
                fontSize: '5rem',
                width: selectedColor === 'w' ? '135px' : '120px', // Increase size when selected
                height: selectedColor === 'w' ? '135px' : '120px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#d6d6d6',
                },
              }}
            >
              ♔
            </Button>

            <Button
              variant="contained"
              onClick={() => setSelectedColor('b')}
              sx={{
                backgroundColor: selectedColor === 'b' ? '#333' : 'black',
                color: 'white',
                fontSize: '5rem',
                width: selectedColor === 'b' ? '135px' : '120px',
                height: selectedColor === 'b' ? '135px' : '120px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#555',
                },
              }}
            >
              ♚
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableEscapeKeyDown
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
        }}
      >
        {currentStep === 1 && 'Choose Your Game Mode'}
        {currentStep === 2 && 'Set Timed Mode Options'}
        {currentStep === 3 && 'Choose Your Starting Color'}
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '230px',
          width: '100%',
        }}
      >
        {renderStepContent()}
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          minHeight: '55px',
        }}
      >
        {currentStep > 1 && (
          <Button onClick={handleBack} color="secondary" variant="contained">
            Back
          </Button>
        )}
        {currentStep < 3 && currentStep !== 1 && (
          <Button
            onClick={handleNext}
            color="secondary"
            variant="contained"
            disabled={!selectedMode}
          >
            Next
          </Button>
        )}
        {currentStep === 3 && (
          <Button onClick={handleConfirm} color="success" variant="contained">
            Start Game
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
