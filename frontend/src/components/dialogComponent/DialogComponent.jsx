import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { useState } from 'react';
import { Chess } from 'chess.js';


const DialogComponent = ({ isOpen, onClose, onSubmit }) => {
    const [fenInput, setFenInput] = useState(''); 
    const [error, setError] = useState(''); // State to store error message if the FEN is invalid

    // Function for handling submiting of FEN
    const handleSubmit = () => {
        const game = new Chess();
        const isValidFen = game.validate_fen(fenInput); 

        if (isValidFen.valid) {
            game.load(fenInput);
            if (game.in_checkmate()) {
                setError("The current FEN represents a checkmate. Please provide a FEN of an ongoing game.");
            } else {
                onSubmit(fenInput);
                setError('');
                setFenInput('');
                onClose();
            }         
        } else {
            setError("Invalid FEN notation. Please enter a valid FEN.");
        }
    };

    
    const handleDialogClose = () => {
        setFenInput('');  
        setError('');    
        onClose();
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
                    helperText={error}     
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
