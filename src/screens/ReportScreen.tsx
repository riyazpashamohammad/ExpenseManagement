// src/screens/Report.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, Image } from 'react-native';
// Placeholder for cute icon, replace with your own K-drama themed image
import CuteDemon from '../../assets/kdrama/cute-demon.png';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryPie } from 'victory';
import { useExpenseReport } from '../hooks/useExpenseReport';



export default function ReportScreen() {
  const { daily, monthly, yearly, category, loading, error } = useExpenseReport();

  if (loading) {
    return (
      <View style={styles.center}>
        <Image source={CuteDemon} style={styles.cuteImage} />
        <ActivityIndicator size="large" color="#b983ff" />
        <Text style={{ marginTop: 12, color: '#b983ff', fontWeight: 'bold' }}>Loading reports...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Image source={CuteDemon} style={styles.cuteImage} />
        <Text style={{ color: '#ff6f91', fontWeight: 'bold' }}>{error}</Text>
      </View>
    );
  }

  const monthlyChartData = Object.entries(monthly).map(([month, total]) => ({ x: month, y: total }));
  const yearlyChartData = Object.entries(yearly).map(([year, total]) => ({ x: year, y: total }));
  const categoryChartData = Object.entries(category).map(([cat, total]) => ({ x: cat, y: total }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}>
      <Image source={CuteDemon} style={styles.cuteImage} />
      <Text style={styles.title}>Expense Report</Text>
      <View key="daily" style={styles.sectionCard}>
        <Text style={styles.header}>📅 Daily Expense Report</Text>
        <FlatList
          data={Object.entries(daily)}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => (
            <Text style={styles.item}>{item[0]}: ₩{item[1].toFixed(2)}</Text>
          )}
          style={styles.list}
          scrollEnabled={false}
        />
      </View>
      <View key="monthly" style={styles.sectionCard}>
        <Text style={styles.header}>📆 Monthly Summary</Text>
        <FlatList
          data={Object.entries(monthly)}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => (
            <Text style={styles.item}>{item[0]}: ₩{item[1].toFixed(2)}</Text>
          )}
          style={styles.list}
          scrollEnabled={false}
        />
      </View>
      <View key="yearly" style={styles.sectionCard}>
        <Text style={styles.header}>📅 Yearly Summary</Text>
        <FlatList
          data={Object.entries(yearly)}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => (
            <Text style={styles.item}>{item[0]}: ₩{item[1].toFixed(2)}</Text>
          )}
          style={styles.list}
          scrollEnabled={false}
        />
      </View>
      <View key="category" style={styles.sectionCard}>
        <Text style={styles.header}>📂 Category-wise Summary</Text>
        <FlatList
          data={Object.entries(category)}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => (
            <Text style={styles.item}>🌸 {item[0]}: ₩{item[1].toFixed(2)}</Text>
          )}
          style={styles.list}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fbeaff', // pastel purple-pink
    flex: 1,
  },
  cuteImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#b983ff',
    backgroundColor: '#fff0f6',
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#b983ff',
    marginBottom: 16,
    marginTop: 8,
    textShadowColor: '#f3c4fb',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    alignSelf: 'center',
  },
  sectionCard: {
    backgroundColor: '#fff0f6',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    width: '95%',
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#f3c4fb',
    alignSelf: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
    color: '#b983ff',
    alignSelf: 'center',
  },
  item: {
    fontSize: 16,
    marginVertical: 4,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    elevation: 2,
    marginHorizontal: 8,
    color: '#6d597a',
    fontWeight: 'bold',
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  list: {
    marginBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbeaff',
  },
});
