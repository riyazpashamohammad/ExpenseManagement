
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenBackground } from '../components/ScreenBackground';
import { useDelivery } from '../context/DeliveryContext';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';

const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const DailyDeliveryScreen = () => {
  const { items, deliveryStatus, setDeliveryState } = useDelivery();
  const theme = useTheme();
  const today = getToday();
  const { appUser } = useAuth();
  // Use the first groupId for now (single group per user assumed)
  const groupId = appUser?.groupIds?.[0] || '';

  return (
    <ScreenBackground>
      <View style={styles.glassCard}>
        <Text style={styles.title}>Daily Delivery Status</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const delivered = groupId ? (deliveryStatus[groupId]?.[today]?.[item.id]) : undefined;
            return (
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: delivered ? theme.colors.accent : theme.colors.primary }]}
                  onPress={() => groupId && setDeliveryState(item.id, today, delivered ? undefined : 'delivered', groupId)}
                  disabled={!groupId}
                >
                  <Text style={styles.btnText}>
                    {delivered ? 'Delivered' : 'Not Delivered'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
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
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemName: {
    flex: 1,
    fontSize: 18,
  },
  button: {
    padding: 10,
    borderRadius: 16,
    marginLeft: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DailyDeliveryScreen;
