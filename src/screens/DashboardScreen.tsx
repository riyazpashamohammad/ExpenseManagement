// src/screens/DashboardScreen.tsx
import React from 'react';
import { View, Button, Text } from 'react-native';

export default function DashboardScreen({ navigation }: any) {
  return (
    <View style={{ padding: 20 }}>
      <Text>Dashboard</Text>
      <Button title="Add Expense" onPress={() => navigation.navigate('AddExpense')} />
      <Button title="View Report" onPress={() => navigation.navigate('Report')} />
    </View>
  );
}
