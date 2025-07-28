// src/screens/Report.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { format, parseISO } from 'date-fns';
import { VictoryBar, VictoryChart, VictoryTheme } from 'victory';

type Expense = {
  amount: number;
  date: string;
  description: string;
  category: string;
};

export default function Report() {
  const [daily, setDaily] = useState<Record<string, number>>({});
  const [monthly, setMonthly] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const ref = collection(db, 'expenses', user.uid, 'entries');
        const snapshot = await getDocs(ref);

        const dailyTotals: Record<string, number> = {};
        const monthlyTotals: Record<string, number> = {};

        snapshot.forEach((doc) => {
          const data = doc.data() as Expense;
          const date = new Date(data.date);
          const dayKey = format(date, 'yyyy-MM-dd');
          const monthKey = format(date, 'yyyy-MM');

          dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + data.amount;
          monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + data.amount;
        });

        setDaily(dailyTotals);
        setMonthly(monthlyTotals);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading reports...</Text>
      </View>
    );
  }

  const monthlyChartData = Object.entries(monthly).map(([month, total]) => ({
    x: month,
    y: total
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📅 Daily Expense Report</Text>
      <FlatList
        data={Object.entries(daily)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item[0]}: ₹{item[1].toFixed(2)}
          </Text>
        )}
      />

      <Text style={styles.header}>📆 Monthly Summary</Text>
      <FlatList
        data={Object.entries(monthly)}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item[0]}: ₹{item[1].toFixed(2)}
          </Text>
        )}
      />

      <Text style={styles.header}>📊 Monthly Chart</Text>
      <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
        <VictoryBar
          data={monthlyChartData}
          style={{ data: { fill: '#4CAF50' } }}
        />
      </VictoryChart>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8
  },
  item: {
    fontSize: 16,
    marginVertical: 4
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
