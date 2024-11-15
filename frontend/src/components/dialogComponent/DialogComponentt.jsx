import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState } from 'react';
import { Chess } from 'chess.js';


export const DialogComponent = ({ isOpen, onClose, onSubmit }) => {
    const [fenInput, setFenInput] = useState(''); // State to store FEN input
    const [error, setError] = useState(''); // State to store error message if the FEN is invalid

    // Function for handling submiting of FEN
    const handleSubmit = () => {
        const game = new Chess();
        const isValidFen = game.load(fenInput); // Check if FEN is valid

        if (isValidFen) {
            onSubmit(fenInput); // Call the onSubmit prop that is passed to submit the FEN entered
            setError('');       // Clear previous error messages
            setFenInput('');    // Clear input field for FEN
            onClose();          // Call the onClose prop that is passed to close the dialog
        } else {
            setError("Invalid FEN notation. Please enter a valid FEN."); // Show error message if FEN is invalid
        }
    };

    // Function for handling the close of dialog
    const handleDialogClose = () => {
        setFenInput('');  // Clear the input field
        setError('');     // Clear error messages
        onClose();        // Call the onClose prop that is passed to actually close the dialog
    };


    return (
        <Dialog open={isOpen} onClose={handleDialogClose}>
            <DialogTitle>Enter FEN Notation</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    placeholder="Enter FEN notation"
                    value={fenInput}
                    onChange={(e) => setFenInput(e.target.value)}
                    error={!!error}       // Shows red underline if the error is set
                    helperText={error}     // Displays error message below the input field
                    autoFocus
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>Submit</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogComponent;
