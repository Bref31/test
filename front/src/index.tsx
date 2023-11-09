import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as StoreProvider } from 'react-redux';

import store from 'store';

import App from './App';
import './index.css';
import { smartlinkTheme } from './themes';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <StoreProvider store={store}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={smartlinkTheme}>
          <CssBaseline />
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </StoreProvider>
  </React.StrictMode>,
);
