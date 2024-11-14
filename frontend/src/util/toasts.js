import toast from 'react-hot-toast';

export const waitForResponseToast = () =>
  toast('Please wait for a response from the last move', {
    icon: '⏳',
  });
