// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';
import { auth } from '../services/firebase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const theme = useTheme();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Dashboard');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Image source={theme.images.cuteDemon} style={styles.cuteImage} />
      <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>Login</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} mode="outlined" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} mode="outlined" />
      <Button onPress={handleLogin} mode="contained" style={{ backgroundColor: theme.colors.primary, borderRadius: 16, marginTop: 12 }}>Login</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  cuteImage: { width: 100, height: 100, marginBottom: 16, borderRadius: 50, borderWidth: 2, borderColor: '#A084CA', backgroundColor: '#fff0f6' },
  input: { width: '100%', maxWidth: 350, marginBottom: 12, backgroundColor: '#fff' },
});
