import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
// src/screens/AddExpenseScreen.tsx
import React, { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ActivityIndicator, Image, View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ScrollView } from 'react-native';
import { TextInput, Button, Snackbar, Text, HelperText } from 'react-native-paper';
import { useAddExpense } from '../hooks/useAddExpense';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../theme/ThemeContext';
import { ScreenBackground } from '../components/ScreenBackground';

import { commonStyles } from '../theme/commonStyles';

export default function AddExpenseScreen({ navigation }: any) {
  const { appUser } = useAuth();
  const userGroups = (appUser?.groupIds || []).map((id: string) => ({ id, name: id }));
  const groupLoading = !appUser;
  const {
    title,
    setTitle,
    category,
    setCategory,
    amount,
    setAmount,
    currency,
    setCurrency,
    groupId,
    setGroupId,
    comment,
    setComment,
    setExpenseDate,
    expenseDate,
    loading,
    success,
    error,
    saveExpense,
  } = useAddExpense();

  // Emoji mood state
  const [selectedMood, setSelectedMood] = React.useState<string>('');
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const moodEmojis = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😐', label: 'Regular' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '🤩', label: 'Excited' }
  ];
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const theme = useTheme();

  const { addNotification } = useNotification();
  // Store the title at the time of save
  const [pendingNotif, setPendingNotif] = React.useState<string | null>(null);

  const handleSaveExpense = async () => {
    setPendingNotif(title);
    await saveExpense({ mood: selectedMood });
  };

  // Set default groupId if only one group
  useEffect(() => {
    if (userGroups.length === 1) setGroupId(userGroups[0].id);
  }, [userGroups, setGroupId]);

  React.useEffect(() => {
    if (success && pendingNotif) {
      setShowSuccess(true);
      const now = new Date();
      const timeString = now.toLocaleString();
      const user = appUser?.firstName || appUser?.email || 'Unknown user';
      addNotification(
        `${user} added expense "${pendingNotif}" at ${timeString}`,
        appUser?.id || '',
        appUser?.groupIds || []
      );
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1200);
      setPendingNotif(null);
    }
    if (error) setShowError(true);
  }, [success, error]);
  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {appUser?.role === 'admin' && (
            <TouchableOpacity
              style={{ backgroundColor: '#b983ff', padding: 10, borderRadius: 8, marginBottom: 16, alignSelf: 'flex-end' }}
              onPress={() => navigation.navigate('ExpenseList')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>View/Edit All Expenses</Text>
            </TouchableOpacity>
          )}
          <View style={styles.glassCard}>
            <Image source={theme.images.cuteDemon} style={commonStyles.cuteImage} />
            <Text variant="titleLarge" style={[commonStyles.title, { color: theme.colors.primary }]}>Add Expense</Text>
            {/* Mood Emoji Row */}
            <View style={styles.moodRow}>
              {moodEmojis.map((mood) => (
                <TouchableOpacity
                  key={mood.emoji}
                  style={[styles.moodEmojiTouchable, selectedMood === mood.emoji && styles.selectedMoodEmojiTouchable]}
                  onPress={() => setSelectedMood(mood.emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.moodEmojiText, selectedMood === mood.emoji && styles.selectedMoodEmojiTextSelected]}>
                    {mood.emoji}
                  </Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Date Picker Row */}
            <View style={{ width: '100%', alignItems: 'center', marginBottom: 12 }}>
              <TouchableOpacity
                style={{ padding: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.primary, marginBottom: 4 }}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                  {`Date: ${expenseDate}`}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(expenseDate)}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setExpenseDate(selectedDate.toISOString());
                  }}
                />
              )}
            </View>
            <TextInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              style={commonStyles.input}
              mode="outlined"
            />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={category}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor={theme.colors.primary}
                onValueChange={(itemValue: string) => setCategory(itemValue)}
              >
                <Picker.Item label="Groceries" value="Groceries" />
                <Picker.Item label="Vegetables" value="Vegetables" />
                <Picker.Item label="Fruits" value="Fruits" />
                <Picker.Item label="Snacks" value="Snacks" />
                <Picker.Item label="Transport" value="Transport" />
                <Picker.Item label="Utilities" value="Utilities" />
                <Picker.Item label="Shopping" value="Shopping" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
            <TextInput
              label="Comments"
              value={comment}
              onChangeText={setComment}
              style={commonStyles.input}
              mode="outlined"
              multiline
              numberOfLines={2}
              placeholder="Add any notes or comments..."
            />
            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={commonStyles.input}
              mode="outlined"
            />
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={currency}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor={theme.colors.primary}
                onValueChange={(itemValue: string) => setCurrency(itemValue)}
              >
                <Picker.Item label="INR (₹)" value="INR" />
                <Picker.Item label="USD ($)" value="USD" />
                <Picker.Item label="EUR (€)" value="EUR" />
              </Picker>
            </View>
            {/* Group selection dropdown if user is in multiple groups */}
            {groupLoading ? null : userGroups.length > 1 ? (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={groupId}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor={theme.colors.primary}
                  onValueChange={(itemValue: string) => setGroupId(itemValue)}
                >
                  {userGroups.map(g => (
                    <Picker.Item key={g.id} label={g.name} value={g.id} />
                  ))}
                </Picker>
              </View>
            ) : userGroups.length === 1 ? (
              <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Group: {userGroups[0].name}</Text>
            ) : null}
            <HelperText type="info">Enter the expense details above.</HelperText>
            <Button
              mode="contained"
              onPress={handleSaveExpense}
              style={[commonStyles.button, { backgroundColor: theme.colors.primary, borderRadius: 16, elevation: 4, shadowColor: theme.colors.primary }]}
              disabled={loading || !title || !category || !amount}
              icon="plus"
            >
              {loading ? 'Saving...' : 'Save Expense'}
            </Button>
            {loading && <ActivityIndicator size="large" style={{ marginTop: 10 }} />}
            <Snackbar
              visible={showSuccess}
              onDismiss={() => setShowSuccess(false)}
              duration={1000}
              style={{ backgroundColor: theme.colors.accent }}
            >
              Expense saved successfully!
            </Snackbar>
            <Snackbar
              visible={showError}
              onDismiss={() => setShowError(false)}
              duration={2000}
              style={{ backgroundColor: '#f44336' }}
            >
              {error}
            </Snackbar>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

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
  pickerItem: {
    fontSize: 16,
    color: '#4B3869',
    fontWeight: 'bold',
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 16,
    width: '100%',
    paddingHorizontal: 8,
    gap: 4,
  },
  moodEmojiTouchable: {
    alignItems: 'center',
    marginHorizontal: 4,
    padding: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#A084CA',
    backgroundColor: '#fff',
    minWidth: 48,
    minHeight: 56,
    elevation: 2,
    shadowColor: '#A084CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 0,
  },
  selectedMoodEmojiTouchable: {
    borderColor: '#FFB300',
    backgroundColor: '#FFF7E0',
    elevation: 4,
    shadowColor: '#FFB300',
  },
  moodEmojiText: {
    fontSize: 28,
    textAlign: 'center',
    color: '#4B3869',
    marginBottom: 2,
    marginTop: 2,
  },
  selectedMoodEmojiTextSelected: {
    color: '#FFB300',
    textShadowColor: '#FFF7E0',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#4B3869',
    marginTop: 0,
    textAlign: 'center',
    fontWeight: '600',
  },
});
