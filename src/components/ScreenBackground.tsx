import React from 'react';
import { ImageBackground, View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { commonStyles } from '../theme/commonStyles';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ children, style }) => {
  const theme = useTheme();
  return (
    <ImageBackground
      source={theme.images.background}
      style={commonStyles.backgroundImage}
      resizeMode="stretch"
    >
      <View style={[commonStyles.container, style]}>
        {children}
      </View>
    </ImageBackground>
  );
};
