import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        },
        success: {
          iconTheme: {
            primary: '#fff',
            secondary: '#333',
          },
        },
        error: {
          iconTheme: {
            primary: '#fff',
            secondary: '#333',
          },
        },
      }}
    />
  );
}