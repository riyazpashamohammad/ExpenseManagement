// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { browserSessionPersistence, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';
import { ScreenBackground } from '../components/ScreenBackground';
import { commonStyles } from '../theme/commonStyles';
import { auth } from '../services/firebase';
import * as SecureStore  from 'expo-secure-store';


import { useAuth } from '../context/AuthContext';
import SplashScreen from './SplashScreen';


export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(true);

  const theme = useTheme();
  const { user, loading } = useAuth();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await SecureStore.setItemAsync('password', password);
      await AsyncStorage.setItem('authUser', JSON.stringify(userCredential.user));
  // navigation will be handled by useEffect after user state updates
    } catch (error: any) {
      alert(error.message);
    }
  };


  // If already logged in, redirect to Dashboard
  React.useEffect(() => {
    if (user) {
      setLocalLoading(false);
      // Prevent navigation loop if already on Dashboard
      if (navigation.getState && navigation.getState().routes) {
        const routes = navigation.getState().routes;
        const currentRoute = routes[routes.length - 1]?.name;
        if (currentRoute !== 'Dashboard') {
          navigation.replace('Dashboard');
        }
      } else {
        navigation.replace('Dashboard');
      }
    }
    if(user == undefined){
      setLocalLoading(false);
    }
  }, [user, loading]);


  return (
    <ScreenBackground>
      <Image source={theme.images.cuteDemon} style={commonStyles.cuteImage} />
      <Text variant="titleLarge" style={[commonStyles.title, { color: theme.colors.primary }]}>Login</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} style={commonStyles.input} mode="outlined" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={commonStyles.input} mode="outlined" />
      <Button onPress={handleLogin} mode="contained" style={[commonStyles.button, { backgroundColor: theme.colors.primary, borderRadius: 16, marginTop: 12 }]}>Login</Button>
    </ScreenBackground>
  );
}

// ...styles removed, using commonStyles instead
