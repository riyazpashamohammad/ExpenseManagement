import { ActivityIndicator, useTheme } from "react-native-paper";
import { ScreenBackground } from "../components/ScreenBackground";
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen({ navigation }: any) {
    const theme = useTheme();
    const { appUser,loading } = useAuth();
    React.useEffect(() => {
        if(!loading && appUser) {
            navigation.replace('Dashboard')
        }
        else if(!loading && appUser === null) {
            navigation.replace('Login')
        }
      }, [appUser, loading]);
  return (
    <ScreenBackground>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </ScreenBackground>
  );
}
