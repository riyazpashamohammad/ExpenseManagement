import React, { createContext, useContext } from 'react';
import { myDemonTheme } from './myDemonTheme';

const ThemeContext = createContext(myDemonTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext.Provider value={myDemonTheme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
