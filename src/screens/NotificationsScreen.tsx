import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, List, Button } from 'react-native-paper';
import { useNotification } from '../context/NotificationContext';

import { useAuth } from '../context/AuthContext';
const NotificationsScreen = ({ navigation }: any) => {
  const { notifications, markAllAsRead, markAsRead } = useNotification();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const { appUser } = useAuth();
  React.useEffect(() => {
    if (!appUser) navigation.replace('Login');
  }, [appUser]);
  const handlePress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    markAsRead(id);
  };
  if (!appUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Button onPress={markAllAsRead} style={styles.button}>Mark all as read</Button>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Try to parse message: "user added expense \"title\" at time"
          let user = '', expense = '', time = '';
          const match = item.message.match(/^(.*?) added expense "(.*?)" at (.*)$/);
          if (match) {
            user = match[1];
            expense = match[2];
            time = match[3];
          }
          return (
            <List.Accordion
              title={expense ? `${user} added an expense` : item.message}
              left={props => <List.Icon {...props} icon={item.read ? 'bell-outline' : 'bell'} />}
              expanded={expandedId === item.id}
              onPress={() => handlePress(item.id)}
              titleStyle={{ fontWeight: item.read ? 'normal' : 'bold' }}
            >
              <View style={{ padding: 12 }}>
                {expense ? (
                  <>
                    <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Expense: <Text style={{ color: '#4B3869' }}>{expense}</Text></Text>
                    <Text style={{ marginTop: 4 }}>Added by: <Text style={{ color: '#b983ff' }}>{user}</Text></Text>
                    <Text style={{ marginTop: 4, color: '#888' }}>Time: {time}</Text>
                  </>
                ) : (
                  <Text style={{ color: '#333' }}>{item.message}</Text>
                )}
                <Text style={{ marginTop: 8, color: '#aaa', fontSize: 12 }}>Created: {new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            </List.Accordion>
          );
        }}
        ListEmptyComponent={<Text>No notifications</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  button: { marginBottom: 12 },
});

export default NotificationsScreen;
