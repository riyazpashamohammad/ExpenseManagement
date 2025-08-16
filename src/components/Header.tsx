import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  navigation?: any;
  routeName?: string;
}

const Header: React.FC<HeaderProps> = ({ title, navigation, routeName }) => {
  const { logout } = useAuth();

  return (
    <View style={styles.header}>
      {title && <View style={styles.titleContainer}><Text style={styles.title}>{title}</Text></View>}
      {navigation && routeName !== 'Dashboard' && (
        <IconButton
          icon="home"
          size={24}
          onPress={() => navigation.navigate('Dashboard')}
          style={styles.homeButton}
          accessibilityLabel="Go to Dashboard"
        />
      )}
      <IconButton
        icon="logout"
        size={24}
        onPress={logout}
        style={styles.logoutButton}
        accessibilityLabel="Logout"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  homeButton: {
    marginLeft: 0,
    marginRight: 8,
  },
  logoutButton: {
    marginLeft: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Header;
