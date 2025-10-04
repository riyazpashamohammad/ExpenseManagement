// src/screens/DashboardScreen.tsx

import React from 'react';
import { View, StyleSheet, Image, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Platform, Dimensions } from 'react-native';
import { Card, Button, Text, Avatar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { ScreenBackground } from '../components/ScreenBackground';
import { useExpensesStats } from '../hooks/useExpensesStats';


export default function DashboardScreen({ navigation }: any) {
  const theme = useTheme();
  const { appUser } = useAuth();
  const [checking, setChecking] = React.useState(true);
  React.useEffect(() => {
    if (typeof appUser === 'undefined' || appUser === null) {
      setChecking(true);
    } else {
      setChecking(false);
      if (!appUser) navigation.replace('Login');
    }
  }, [appUser]);

 
  const { total, month, loading } = useExpensesStats(appUser?.groupIds);

  return (
    <ScreenBackground>
      <ImageBackground
        source={theme.images.background || require('../../assets/mydemon/background.png')}
        style={styles.bgImage}
        blurRadius={8}
      >
        <View style={styles.overlay}>
          <View style={styles.headerRow}>
            <Avatar.Image
              size={56}
              source={theme.images.cuteDemon}
              style={styles.avatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="titleMedium" style={styles.greeting}>
                Hello, {appUser?.firstName || 'User'}
              </Text>
            </View>
          </View>

          <Card style={styles.glassCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.title}>Expense Dashboard</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total Expenses</Text>
                  {loading && total === null ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <Text style={styles.statValue}>{total?.toLocaleString() ?? '-'}</Text>
                  )}
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>This Month</Text>
                  {loading && month === null ? (
                    <ActivityIndicator size="small" color={theme.colors.accent} />
                  ) : (
                    <Text style={styles.statValue}>{month?.toLocaleString() ?? '-'}</Text>
                  )}
                </View>
              </View>
              <Text variant='bodyMedium' style={styles.paragraph}>
                {appUser?.loginMessage ?? 'Welcome back! Ready to manage your expenses?'} 💸
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.buttonGroup}>
            <Button
              mode="contained"
              icon="plus"
              style={[styles.gradientButton, { backgroundColor: '#A084CA' }]}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              onPress={() => navigation.navigate('AddExpense')}
            >
              Add Expense
            </Button>
            <Button
              mode="contained"
              icon="chart-bar"
              style={[styles.gradientButton, { backgroundColor: theme.colors.accent }]}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              onPress={() => navigation.navigate('Report')}
            >
              View Report
            </Button>
            <Button
              mode="contained"
              icon="truck"
              style={[styles.gradientButton, { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.primary }]}
              labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
              onPress={() => navigation.navigate('DailyDelivery')}
            >
              Daily Deliveries
            </Button>
          </View>
        </View>
      </ImageBackground>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)', // less opaque for more visible bg
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#A084CA',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F7A8B8',
  },
  subGreeting: {
    fontSize: 14,
    color: '#6D6D6D',
    marginTop: 2,
  },
  subGreetingVisible: {
    fontSize: 15,
    color: '#F7A8B8', // vibrant accent color
    marginTop: 2,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.2,
  },
  notifIcon: {
    backgroundColor: '#fff',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#A084CA',
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 24,
    marginBottom: 24,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#E0C3FC',
    shadowColor: '#A084CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3D246C',
    marginBottom: 12,
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#6D6D6D',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  paragraph: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: 12,
    gap: 12,
  },
  gradientButton: {
    marginVertical: 6,
    borderRadius: 18,
    width: '100%',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 3,
    backgroundColor: 'linear-gradient(90deg, #A084CA 0%, #E0C3FC 100%)',
    borderWidth: 0,
  },
  buttonContent: {
    height: 54,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    flex: 1,
    flexWrap: 'wrap',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
