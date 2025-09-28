// App.tsx
import React from 'react';


import AppNavigator from './src/navigation/AppNavigator';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { DeliveryProvider } from './src/context/DeliveryContext';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PaperProvider>
          <NotificationProvider>
            <DeliveryProvider>
              <AppNavigator />
            </DeliveryProvider>
          </NotificationProvider>
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
