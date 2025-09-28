import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export interface ExpenseFormProps {
  initialValues: {
    title: string;
    category: string;
    amount: string;
    currency: string;
    comment: string;
    expenseDate: string;
  };
  loading: boolean;
  onSubmit: (values: any) => void;
  submitLabel: string;
  categories: string[];
}

export default function ExpenseForm({ initialValues, loading, onSubmit, submitLabel, categories }: ExpenseFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [category, setCategory] = useState(initialValues.category);
  const [amount, setAmount] = useState(initialValues.amount);
  const [currency, setCurrency] = useState(initialValues.currency);
  const [comment, setComment] = useState(initialValues.comment);
  const [expenseDate, setExpenseDate] = useState(initialValues.expenseDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format as yyyy-mm-dd HH:MM
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth()+1)}-${pad(selectedDate.getDate())} ${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}`;
      setExpenseDate(formatted);
    }
  };

  return (
    <View style={styles.form}>
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
          onValueChange={setCategory}
        >
          {categories.map(cat => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>
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
          onValueChange={setCurrency}
        >
          <Picker.Item label="INR (₹)" value="INR" />
          <Picker.Item label="USD ($)" value="USD" />
          <Picker.Item label="EUR (€)" value="EUR" />
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
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: '#b983ff', fontWeight: 'bold' }}>
          {`Date: ${expenseDate}`}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={expenseDate ? new Date(expenseDate.replace(' ', 'T')) : new Date()}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Button
        mode="contained"
        onPress={() => onSubmit({ title, category, amount, currency, comment, expenseDate })}
        style={styles.button}
        disabled={loading || !title || !category || !amount}
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    paddingBottom: 24,
  },
  input: {
    marginBottom: 12,
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
  dateBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b983ff',
    marginBottom: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#b983ff',
    borderRadius: 16,
    marginTop: 8,
  },
});
