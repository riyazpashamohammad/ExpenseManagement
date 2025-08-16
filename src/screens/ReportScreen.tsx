// src/screens/Report.tsx
import React,{ useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ScreenBackground } from '../components/ScreenBackground';
import { commonStyles } from '../theme/commonStyles';
import CuteDemon from '../../assets/mydemon/cute-demon.png';
import { useExpenseReport } from '../hooks/useExpenseReport';


export default function ReportScreen() {
  const { daily, monthly, yearly, category, loading, error } = useExpenseReport();
  const [selectedTab, setSelectedTab] = useState<'daily' | 'monthly' | 'yearly' | 'category'>('daily');

  if (loading) {
    return (
      <ScreenBackground>
        <Image source={CuteDemon} style={commonStyles.cuteImage} />
        <ActivityIndicator size="large" color="#b983ff" />
        <Text style={{ marginTop: 12, color: '#b983ff', fontWeight: 'bold' }}>Loading reports...</Text>
      </ScreenBackground>
    );
  }
  if (error) {
    return (
      <ScreenBackground>
        <Image source={CuteDemon} style={commonStyles.cuteImage} />
        <Text style={{ color: '#ff6f91', fontWeight: 'bold' }}>{error}</Text>
      </ScreenBackground>
    );
  }

  const tabData = {
    daily: {
      title: '📅 Daily Expense Report',
      data: Object.entries(daily),
      render: (item: [string, number]) => (
        <Text style={styles.item}>{item[0]}: ₹{item[1].toFixed(2)}</Text>
      ),
    },
    monthly: {
      title: '📆 Monthly Summary',
      data: Object.entries(monthly),
      render: (item: [string, number]) => (
        <Text style={styles.item}>{item[0]}: ₹{item[1].toFixed(2)}</Text>
      ),
    },
    yearly: {
      title: '📅 Yearly Summary',
      data: Object.entries(yearly),
      render: (item: [string, number]) => (
        <Text style={styles.item}>{item[0]}: ₹{item[1].toFixed(2)}</Text>
      ),
    },
    category: {
      title: '📂 Category-wise Summary',
      data: Object.entries(category),
      render: (item: [string, number]) => (
        <Text style={styles.item}>🌸 {item[0]}: ₹{item[1].toFixed(2)}</Text>
      ),
    },
  };

  return (
    <ScreenBackground style={{ paddingHorizontal: 0 }}>
      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}>
        <Image source={CuteDemon} style={commonStyles.cuteImage} />
        <Text style={[commonStyles.title, { color: '#b983ff' }]}>Expense Report</Text>
        <View style={styles.tabBar}>
          {(['daily', 'monthly', 'yearly', 'category'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, selectedTab === tab && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tabData[tab].title.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.header}>{tabData[selectedTab].title}</Text>
          <FlatList
            data={tabData[selectedTab].data}
            keyExtractor={(item) => item[0]}
            renderItem={({ item }) => tabData[selectedTab].render(item)}
            style={styles.list}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={{ color: '#b983ff', alignSelf: 'center', marginTop: 12 }}>No data found.</Text>}
          />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  // container and cuteImage/title styles removed, using commonStyles instead
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
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: '#f3c4fb',
    borderWidth: 1,
    borderColor: '#b983ff',
  },
  tabButtonActive: {
    backgroundColor: '#b983ff',
  },
  tabText: {
    color: '#b983ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#fff',
  },
});
