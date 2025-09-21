// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, StyleSheet, Image, ImageBackground } from 'react-native';
import { Platform, Dimensions } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import SplashScreen from './SplashScreen';
import { ScreenBackground } from '../components/ScreenBackground';


export default function DashboardScreen({ navigation }: any) {
  const theme = useTheme();
  const { appUser } = useAuth();
  const { width, height } = Dimensions.get('window');
  const [checking, setChecking] = React.useState(true);
  React.useEffect(() => {
    if (typeof appUser === 'undefined' || appUser === null) {
      setChecking(true);
    } else {
      setChecking(false);
      if (!appUser) navigation.replace('Login');
    }
  }, [appUser]);
  if (checking) return <SplashScreen />;
  if (!appUser) return <SplashScreen />;
  return (
    <ScreenBackground>
      <View style={[styles.container, { backgroundColor: 'transparent' }]}> 
        <Image source={theme.images.cuteDemon} style={styles.cuteImage} />
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.primary }]}>Expense Dashboard</Text>
        <Card style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
          <Card.Content>
            <Text variant='bodyMedium' style={[styles.paragraph, { color: theme.colors.text }]}>SweetHeart! Expenses dekhke karo 💸</Text>
          </Card.Content>
        </Card>
        <Button
          mode="contained"
          icon="plus"
          style={[styles.button, { backgroundColor: theme.colors.primary, borderRadius: 16 }]}
          onPress={() => navigation.navigate('AddExpense')}
        >
          Add Expense
        </Button>
        <Button
          mode="contained"
          icon="chart-bar"
          style={[styles.button, { backgroundColor: theme.colors.accent, borderRadius: 16 }]}
          onPress={() => navigation.navigate('Report')}
        >
          View Report
        </Button>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 60, 
    paddingBottom: 48
  },
  cuteImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#A084CA',
    backgroundColor: '#fff0f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    alignSelf: 'center',
  },
  card: {
    marginBottom: 24,
    elevation: 2,
    borderWidth: 2,
  },
  paragraph: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#333',
  },
  button: {
    marginVertical: 8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
