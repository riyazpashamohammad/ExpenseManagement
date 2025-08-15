// src/screens/AddExpenseScreen.tsx
import React from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { TextInput, Button, Snackbar, Title, HelperText } from 'react-native-paper';
import { useAddExpense } from '../hooks/useAddExpense';
import { useTheme } from '../theme/ThemeContext';

export default function AddExpenseScreen({ navigation }: any) {
  const {
    title,
    setTitle,
    category,
    setCategory,
    amount,
    setAmount,
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
      <TextInput
        label="Category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
      />
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
  button: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#A084CA',
  },
});
