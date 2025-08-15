// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';

export default function DashboardScreen({ navigation }: any) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Image source={theme.images.cuteDemon} style={styles.cuteImage} />
      <Title style={[styles.title, { color: theme.colors.primary }]}>Expense Dashboard</Title>
      <Card style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
        <Card.Content>
          <Paragraph style={[styles.paragraph, { color: theme.colors.text }]}>Welcome! Track your expenses and view detailed reports.</Paragraph>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
