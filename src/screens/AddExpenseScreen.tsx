// src/screens/AddExpenseScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { db, auth } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function AddExpenseScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const saveExpense = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, 'expenses'), {
      title,
      category,
      amount: parseFloat(amount),
      userId: user.uid,
      date: new Date().toISOString()
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput label="Title" value={title} onChangeText={setTitle} />
      <TextInput label="Category" value={category} onChangeText={setCategory} />
      <TextInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Button mode="contained" onPress={saveExpense}>Save</Button>
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 20 } });
