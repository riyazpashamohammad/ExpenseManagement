// src/screens/UserManagementScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, Card, TextInput, Title } from 'react-native-paper';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppUser, UserRole } from '../types/user';

export default function UserManagementScreen() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  return (
    <View style={styles.container}>
      <Title>User Management</Title>
      <TextInput
        label="Search by email"
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />
      <FlatList
        data={users.filter(u => u.email.includes(search))}
        keyExtractor={u => u.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text>Email: {item.email}</Text>
              <Text>Role: {item.role}</Text>
              <Text>Groups: {item.groupIds.join(', ') || 'None'}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <Button
                  mode={item.role === 'user' ? 'contained' : 'outlined'}
                  onPress={() => handleRoleChange(item.id, 'user')}
                  style={styles.button}
                >
                  User
                </Button>
                <Button
                  mode={item.role === 'admin' ? 'contained' : 'outlined'}
                  onPress={() => handleRoleChange(item.id, 'admin')}
                  style={styles.button}
                >
                  Admin
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        refreshing={loading}
        onRefresh={() => {
          setLoading(true);
          getDocs(collection(db, 'users')).then(snap => {
            setUsers(snap.docs.map(doc => doc.data() as AppUser));
            setLoading(false);
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 12 },
  card: { marginBottom: 12 },
  button: { marginRight: 8 },
});
