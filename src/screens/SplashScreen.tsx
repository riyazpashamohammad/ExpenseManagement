import { ActivityIndicator, useTheme } from "react-native-paper";
import { ScreenBackground } from "../components/ScreenBackground";

export default function SplashScreen() {
    const theme = useTheme();
  return (
    <ScreenBackground>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </ScreenBackground>
  );
}
