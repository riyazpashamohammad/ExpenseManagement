// src/screens/UserManagementScreen.tsx

import React, { useEffect, useState } from 'react';
import { Alert, FlatList, View, StyleSheet, Dimensions } from 'react-native';
import { ScreenBackground } from '../components/ScreenBackground';
import { Text, Button, TextInput, Title } from 'react-native-paper';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppUser, UserRole } from '../types/user';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

export default function UserManagementScreen({ navigation }: any) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { appUser } = useAuth();
  const theme = useTheme();
  useEffect(() => {
    if (!appUser) navigation.replace('Login');
  }, [appUser]);
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => doc.data() as AppUser));
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
      Alert.alert('Error', 'Failed to update role');
    }
  };
  if (!appUser) return null;
  return (
    <ScreenBackground>
      <View style={styles.glassCard}>
        <Title style={styles.title}>User Management</Title>
        <TextInput
          label="Search by email"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          mode="outlined"
          outlineColor={theme.colors.primary}
          activeOutlineColor={theme.colors.accent}
        />
        <FlatList
          data={users.filter(u => u.email.includes(search))}
          keyExtractor={(u: any) => u.id}
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            getDocs(collection(db, 'users')).then(snap => {
              setUsers(snap.docs.map(doc => doc.data() as AppUser));
              setLoading(false);
            });
          }}
          renderItem={({ item }: { item: AppUser }) => (
            <View style={styles.userCard}>
              <Text style={styles.email}>Email: <Text style={{ color: theme.colors.primary }}>{item.email}</Text></Text>
              <Text style={styles.role}>Role: <Text style={{ color: theme.colors.accent }}>{item.role}</Text></Text>
              <Text style={styles.groups}>Groups: <Text style={{ color: theme.colors.text }}>{item.groupIds.join(', ') || 'None'}</Text></Text>
              <View style={styles.buttonRow}>
                <Button
                  mode={item.role === 'user' ? 'contained' : 'outlined'}
                  onPress={() => handleRoleChange(item.id, 'user')}
                  style={styles.button}
                  labelStyle={{ color: item.role === 'user' ? '#fff' : theme.colors.primary, fontWeight: 'bold' }}
                  color={theme.colors.primary}
                >
                  User
                </Button>
                <Button
                  mode={item.role === 'admin' ? 'contained' : 'outlined'}
                  onPress={() => handleRoleChange(item.id, 'admin')}
                  style={styles.button}
                  labelStyle={{ color: item.role === 'admin' ? '#fff' : theme.colors.accent, fontWeight: 'bold' }}
                  color={theme.colors.accent}
                >
                  Admin
                </Button>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: theme.colors.text, textAlign: 'center', marginTop: 32 }}>No users found</Text>}
        />
      </View>
    </ScreenBackground>
  );
}


const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 28,
    marginBottom: 24,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#E0C3FC',
    shadowColor: '#A084CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginTop: 18,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4B3869',
    alignSelf: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 16,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 12,
  },
  userCard: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0C3FC',
    shadowColor: '#A084CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    padding: 16,
    overflow: 'hidden',
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B3869',
    marginBottom: 2,
  },
  role: {
    fontSize: 15,
    marginBottom: 2,
  },
  groups: {
    fontSize: 14,
    marginBottom: 8,
    color: '#4B3869',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    marginRight: 8,
    borderRadius: 16,
    minWidth: 90,
  },
});
