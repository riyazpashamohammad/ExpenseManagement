const styles = StyleSheet.create({
  glassCard: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 40,
    paddingTop: 8,
    width: '100%',
    maxWidth: 370,
    alignSelf: 'center',
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
    paddingHorizontal: 12,
  },
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
  errorText: {
    color: '#E57373',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  loadingText: {
    color: '#b983ff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

import React, { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs } from 'firebase/firestore';
import { View, Text, Alert, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import { useTheme } from '../theme/ThemeContext';
import { ScreenBackground } from '../components/ScreenBackground';
import { commonStyles } from '../theme/commonStyles';


const CATEGORIES = [
  'Groceries', 'Vegetables', 'Fruits', 'Snacks', 'Transport', 'Utilities', 'Shopping', 'Other'
];

export default function EditExpenseScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { appUser } = useAuth();
  const theme = useTheme();
  const { expenseId } = route.params as { expenseId: string };
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<any>(null);
  const [original, setOriginal] = useState<any>(null);
  const userGroups = (appUser?.groupIds || []).map((id: string) => ({ id, name: id }));
  const groupLoading = !appUser;
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        if (!appUser) return;
        // Fetch expense
        const docRef = doc(db, 'expenses', expenseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Format date as yyyy-mm-dd HH:MM
          let dateStr = data.expenseDate || '';
          if (dateStr) {
            const d = new Date(dateStr);
            const pad = (n: number) => n.toString().padStart(2, '0');
            dateStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
          }
          setInitial({
            title: data.title || '',
            category: data.category || 'Groceries',
            amount: data.amount?.toString() || '',
            currency: data.currency || 'INR',
            comment: data.comment || '',
            expenseDate: dateStr || '',
            groupId: data.groupId || (userGroups.length === 1 ? userGroups[0].id : ''),
          });
          setOriginal({
            title: data.title || '',
            category: data.category || 'Groceries',
            amount: data.amount?.toString() || '',
            currency: data.currency || 'INR',
            comment: data.comment || '',
            expenseDate: dateStr || '',
            groupId: data.groupId || (userGroups.length === 1 ? userGroups[0].id : ''),
          });
          setSelectedGroupId(data.groupId || (userGroups.length === 1 ? userGroups[0].id : ''));
        } else {
          Alert.alert('Error', 'Expense not found');
          navigation.goBack();
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to load expense');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [expenseId, appUser, userGroups]);

  const handleSave = async (values: any) => {
    // Only update changed fields
    const delta: any = {};
    Object.keys(values).forEach(key => {
      if (values[key] !== original[key]) delta[key] = key === 'amount' ? parseFloat(values[key]) : values[key];
    });
    if (Object.keys(delta).length === 0) {
      Alert.alert('No changes', 'No fields were changed.');
      return;
    }
    try {
      setLoading(true);
      const docRef = doc(db, 'expenses', expenseId);
      await updateDoc(docRef, delta);
      Alert.alert('Success', 'Expense updated successfully');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  if (!appUser || appUser.role !== 'admin') {
    return (
      <ScreenBackground>
        <Text style={styles.errorText}>Access denied. Admins only.</Text>
      </ScreenBackground>
    );
  }
  if (loading || !initial) {
    return (
      <ScreenBackground>
        <Image source={theme.images.cuteDemon} style={commonStyles.cuteImage} />
        <Text style={styles.loadingText}>Loading...</Text>
      </ScreenBackground>
    );
  }
  return (
    <ScreenBackground>
      <View style={styles.glassCard}>
        <Image source={theme.images.cuteDemon} style={commonStyles.cuteImage} />
        <Text style={[commonStyles.title, { color: theme.colors.primary }]}>Edit Expense</Text>
        {groupLoading ? null : userGroups.length > 1 ? (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedGroupId}
              style={styles.picker}
              onValueChange={val => {
                setSelectedGroupId(val);
                setInitial((prev: any) => ({ ...prev, groupId: val }));
              }}
            >
              {userGroups.map(g => (
                <Picker.Item key={g.id} label={g.name} value={g.id} />
              ))}
            </Picker>
          </View>
        ) : userGroups.length === 1 ? (
          <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Group: {userGroups[0].name}</Text>
        ) : null}
        <ExpenseForm
          initialValues={initial}
          loading={loading}
          onSubmit={handleSave}
          submitLabel="Save Changes"
          categories={CATEGORIES}
        />
      </View>
    </ScreenBackground>
  );
}
