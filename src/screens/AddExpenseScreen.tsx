// src/screens/AddExpenseScreen.tsx
import React from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { TextInput, Button, Snackbar, Title, HelperText } from 'react-native-paper';
import { useAddExpense } from '../hooks/useAddExpense';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../theme/ThemeContext';

export default function AddExpenseScreen({ navigation }: any) {
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
    loading,
    success,
    error,
    saveExpense,
  } = useAddExpense();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const theme = useTheme();

  React.useEffect(() => {
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 1200);
    }
    if (error) setShowError(true);
  }, [success, error]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <Image source={theme.images.heart} style={styles.cuteImage} />
      <Title style={[styles.title, { color: theme.colors.primary }]}>Add Expense</Title>
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
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
        style={styles.input}
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
        style={styles.input}
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
      {/* TODO: Add group selection UI here */}
      <HelperText type="info">Enter the expense details above.</HelperText>
      <Button
        mode="contained"
        onPress={() => saveExpense()}
        style={[styles.button, { backgroundColor: theme.colors.primary, borderRadius: 16 }]}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cuteImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#A084CA',
    backgroundColor: '#fff0f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 350,
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
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    color: '#4B3869',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pickerItem: {
    fontSize: 16,
    color: '#4B3869',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#A084CA',
  },
});
