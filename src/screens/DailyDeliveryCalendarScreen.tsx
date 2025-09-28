import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';
import { useDelivery, getDeliveryLabel } from '../context/DeliveryContext';
import { useTheme } from '../theme/ThemeContext';
import { ScreenBackground } from '../components/ScreenBackground';
import { commonStyles } from '../theme/commonStyles';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';


const DailyDeliveryCalendarScreen = () => {
  const { items, deliveryStatus, setDeliveryState } = useDelivery();
  const theme = useTheme();
  const { appUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [groups, setGroups] = useState<{ id: string, name: string, members: string[] }[]>([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // Fetch groups for user/admin
  useEffect(() => {
    const fetchGroups = async () => {
      setGroupLoading(true);
      if (!appUser) return;
      
      setGroups(appUser.groupIds ? appUser.groupIds.map(gid => ({ id: gid, name: gid, members: [] })) : []);
      if (appUser.groupIds.length > 0) setSelectedGroupId(appUser.groupIds[0]);
      setGroupLoading(false);
    };
    fetchGroups();
  }, [appUser]);

  // Marked dates for calendar (filtered by group)
  const markedDates = React.useMemo(() => {
    if (!selectedGroupId) return {};
    // deliveryStatus is expected to be per group in next step
    return Object.keys(deliveryStatus[selectedGroupId] || {}).reduce((acc, date) => {
      const deliveredCount = items.filter(item => deliveryStatus[selectedGroupId]?.[date]?.[item.id]).length;
      if (deliveredCount > 0) {
        acc[date] = {
          marked: true,
          dotColor: theme.colors.accent,
          selected: date === selectedDate,
          selectedColor: theme.colors.primary,
        };
      }
      return acc;
    }, {} as Record<string, any>);
  }, [deliveryStatus, selectedGroupId, items, selectedDate, theme.colors.accent, theme.colors.primary]);

  const openModal = (date: string) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  return (
    <ScreenBackground>
      <View style={styles.glassCard}>
        <Text style={styles.title}>Delivery Calendar</Text>
        {groupLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginBottom: 16 }} />
        ) : groups.length > 0 ? (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedGroupId}
              style={styles.picker}
              onValueChange={setSelectedGroupId}
            >
              {groups.map(g => (
                <Picker.Item key={g.id} label={g.name} value={g.id} />
              ))}
            </Picker>
          </View>
        ) : (
          <Text style={{ color: theme.colors.error, marginBottom: 12 }}>No groups found.</Text>
        )}
        <Calendar
          onDayPress={(day: { dateString: string }) => openModal(day.dateString)}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: theme.colors.primary,
            },
          }}
          theme={{
            todayTextColor: theme.colors.accent,
            selectedDayBackgroundColor: theme.colors.primary,
          }}
        />
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalGlassCard}>
              <Text style={styles.modalTitle}>Set Delivery Status for {selectedDate}</Text>
              {items.map(item => {
                const state = deliveryStatus[selectedGroupId]?.[selectedDate]?.[item.id];
                const label = getDeliveryLabel(item.id);
                return (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: state === 'delivered' ? theme.colors.accent : theme.colors.primary }]}
                        onPress={() => setDeliveryState(item.id, selectedDate, 'delivered', selectedGroupId)}
                      >
                        <Text style={styles.btnText}>{label}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: state === 'not_delivered' ? theme.colors.error : theme.colors.primary }]}
                        onPress={() => setDeliveryState(item.id, selectedDate, 'not_delivered', selectedGroupId)}
                      >
                        <Text style={styles.btnText}>{`Not ${label}`}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  pickerWrapper: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A084CA',
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    color: '#4B3869',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignSelf: 'center',
  },
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
  modalGlassCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    width: '98%',
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#E0C3FC',
    shadowColor: '#A084CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  closeBtn: {
    backgroundColor: '#A084CA',
    padding: 10,
    borderRadius: 16,
    marginTop: 16,
    alignItems: 'center',
  },
});

export default DailyDeliveryCalendarScreen;
