// src/screens/UserManagementScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, View, StyleSheet } from 'react-native';
import { ScreenBackground } from '../components/ScreenBackground';
import Header from '../components/Header';
import { commonStyles } from '../theme/commonStyles';
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
    <ScreenBackground>
      <Header />
      <Title>User Management</Title>
      <TextInput
        label="Search by email"
        value={search}
        onChangeText={setSearch}
        style={commonStyles.input}
      />
      <FlatList
        data={users.filter(u => u.email.includes(search))}
  keyExtractor={(u: any) => u.id}
  renderItem={({ item }: { item: any }) => (
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
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  button: { marginRight: 8 },
});
