import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../theme/ThemeContext';

interface HeaderProps {
  title?: string;
  navigation?: any;
  routeName?: string;
}

const Header: React.FC<HeaderProps> = ({ title, navigation, routeName }) => {
  const { logout, appUser } = useAuth();
  const theme = useTheme();
  const { unreadCount } = useNotification();

  const handleLogout = async () => {
    await logout();
    if (navigation) navigation.replace('Login');
  };

  return (
    <View style={styles.header}>
      {/* Home button on the left */}
      {navigation && routeName !== 'Dashboard' && (
        <IconButton
          icon="home"
          size={24}
          onPress={() => {
            if (!appUser) {
              navigation.replace('Login');
            } else {
              navigation.navigate('Dashboard');
            }
          }}
          style={styles.homeButtonLeft}
          accessibilityLabel="Go to Dashboard"
        />
      )}
      {/* Title and user info in the center */}
      <View style={styles.centerContainer}>
        {title && <Text style={styles.title}>{title}</Text>}
        {appUser && (
          <Text style={styles.userText}>{appUser.firstName || appUser.email}</Text>
        )}
      </View>
      
              {appUser?.role === 'admin' && (
                <IconButton
                  icon="account-cog"
                  onPress={() => navigation.navigate('UserManagement')}
                />
              )}
      {/* Notification and logout on the right */}
      <NotificationBell unreadCount={unreadCount} onPress={() => navigation && navigation.navigate('Notifications')} />
      <IconButton
        icon="logout"
        size={24}
        onPress={handleLogout}
        style={styles.logoutButton}
        accessibilityLabel="Logout"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  homeButtonLeft: {
    marginRight: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userText: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  logoutButton: {
    marginLeft: 0,
  }
});

export default Header;
