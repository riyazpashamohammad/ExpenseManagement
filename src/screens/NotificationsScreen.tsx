import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { Text, List, Button } from 'react-native-paper';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { ScreenBackground } from '../components/ScreenBackground';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const NotificationsScreen = ({ navigation }: any) => {
  const { notifications, markAllAsRead, markAsRead } = useNotification();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const { appUser } = useAuth();
  const theme = useTheme();
  React.useEffect(() => {
    if (!appUser) navigation.replace('Login');
  }, [appUser]);
  const handlePress = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    markAsRead(id);
  };
  if (!appUser) {
    return (
      <ScreenBackground>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenBackground>
    );
  }
  return (
    <ScreenBackground>
      <View style={styles.glassCard}>
        <Text style={styles.title}>Notifications</Text>
        <Button onPress={markAllAsRead} style={styles.button} labelStyle={{ color: theme.colors.text, fontWeight: 'bold' }} mode="contained" color={theme.colors.accent}>
          Mark all as read
        </Button>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            let user = '', expense = '', time = '';
            const match = item.message.match(/^(.*?) added expense "(.*?)" at (.*)$/);
            if (match) {
              user = match[1];
              expense = match[2];
              time = match[3];
            }
            return (
              <View style={styles.notificationCard}>
                <List.Accordion
                  title={expense ? `${user} added an expense` : item.message}
                  left={props => <List.Icon {...props} icon={item.read ? 'bell-outline' : 'bell'} color={item.read ? theme.colors.primary : theme.colors.accent} />}
                  expanded={expandedId === item.id}
                  onPress={() => handlePress(item.id)}
                  titleStyle={{ fontWeight: item.read ? 'normal' : 'bold', color: theme.colors.text }}
                  style={{ backgroundColor: 'transparent' }}
                >
                  <View style={{ padding: 12 }}>
                    {expense ? (
                      <>
                        <Text style={{ fontWeight: 'bold', fontSize: 15, color: theme.colors.text }}>Expense: <Text style={{ color: theme.colors.accent }}>{expense}</Text></Text>
                        <Text style={{ marginTop: 4, color: theme.colors.text }}>Added by: <Text style={{ color: theme.colors.primary }}>{user}</Text></Text>
                        <Text style={{ marginTop: 4, color: '#888' }}>Time: {time}</Text>
                      </>
                    ) : (
                      <Text style={{ color: theme.colors.text }}>{item.message}</Text>
                    )}
                    <Text style={{ marginTop: 8, color: '#aaa', fontSize: 12 }}>Created: {new Date(item.createdAt).toLocaleString()}</Text>
                  </View>
                </List.Accordion>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={{ color: theme.colors.text, textAlign: 'center', marginTop: 32 }}>No notifications</Text>}
        />
      </View>
    </ScreenBackground>
  );
};


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
  button: {
    marginBottom: 16,
    borderRadius: 16,
    alignSelf: 'center',
    width: 180,
  },
  notificationCard: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0C3FC',
    shadowColor: '#A084CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
});

export default NotificationsScreen;
