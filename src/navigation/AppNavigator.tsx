// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ReportScreen from '../screens/ReportScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import Header from '../components/Header';
import NotificationsScreen from '../screens/NotificationsScreen';



const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
  <Stack.Navigator initialRouteName="Login">
  <Stack.Screen name="Notifications" component={NotificationsScreen} options={({ navigation, route }) => ({ header: () => <Header navigation={navigation} routeName={route.name} /> })} />
        <Stack.Screen name="Login" component={LoginScreen} options={({ navigation, route }) => ({ header: () => <Header navigation={navigation} routeName={route.name} /> })} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={({ navigation, route }) => ({ header: () => <Header navigation={navigation} routeName={route.name} /> })} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={({ navigation, route }) => ({ header: () => <Header navigation={navigation} routeName={route.name} /> })} />
        <Stack.Screen name="Report" component={ReportScreen} options={({ navigation, route }) => ({ header: () => <Header navigation={navigation} routeName={route.name} /> })} />
        <Stack.Screen name="UserManagement" component={UserManagementScreen} options={({ navigation, route }) => ({ header: () => <Header navigation={navigation} routeName={route.name} /> })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
