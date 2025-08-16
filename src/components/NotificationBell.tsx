import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Badge } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

interface NotificationBellProps {
  unreadCount: number;
  onPress: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ unreadCount, onPress }) => {
  return (
    <View style={styles.container}>
      <IconButton
        icon="bell"
        size={24}
        onPress={onPress}
        accessibilityLabel="Notifications"
      />
      {unreadCount > 0 && (
        <Badge style={styles.badge}>{unreadCount}</Badge>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ff5252',
    color: '#fff',
    fontSize: 12,
    zIndex: 10,
  },
});

export default NotificationBell;
