// src/screens/Report.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { ScreenBackground } from '../components/ScreenBackground';
import { commonStyles } from '../theme/commonStyles';
const CuteDemon = require('../../assets/mydemon/cute-demon.png');
import { useExpenseReport } from '../hooks/useExpenseReport';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';


export default function ReportScreen({ navigation }: any) {
  const { appUser } = useAuth();
  const { daily, monthly, yearly, category, expenses, loading, error } = useExpenseReport();
  // Groupwise summary for admin (group name and sum of all users in that group)
  const [groupwise, setGroupwise] = React.useState<{ x: string, y: number }[]>([]);
  React.useEffect(() => {
    const fetchGroupwise = async () => {
      if (!appUser || appUser.role !== 'admin' || !expenses) return setGroupwise([]);
      // 1. Get all users
      const usersSnap = await getDocs(collection(db, 'users'));
      const groupMap: Record<string, { name: string, members: string[] }> = {};
      usersSnap.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.groupIds)) {
          data.groupIds.forEach((gid: string) => {
            if (!groupMap[gid]) groupMap[gid] = { name: gid, members: [] };
            groupMap[gid].members.push(data.id);
          });
        }
      });
      // 2. For each group, sum all expenses of its members
      const groupTotals: { x: string, y: number }[] = Object.entries(groupMap).map(([gid, group]) => {
        const total = expenses.filter(e => group.members.includes(e.userId)).reduce((sum, e) => sum + e.amount, 0);
        return { x: group.name, y: total };
      });
      setGroupwise(groupTotals.filter(g => g.y > 0));
    };
    fetchGroupwise();
  }, [appUser, expenses]);
  const [selectedTab, setSelectedTab] = useState<'daily' | 'monthly' | 'yearly' | 'category'>('daily');
  React.useEffect(() => {
    if (!appUser) navigation.replace('Login');
  }, [appUser]);
  if (!appUser) return null;
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

  const chartConfig = {
    backgroundGradientFrom: '#fff0f6',
    backgroundGradientTo: '#fff0f6',
    color: (opacity = 1) => `rgba(185, 131, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(109, 89, 122, ${opacity})`,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const tabData = {
    daily: {
      title: '📅 Daily Expense Report',
      data: Object.entries(daily),
      chart: (
        <BarChart
          data={{
            labels: Object.keys(daily),
            datasets: [{ data: Object.values(daily) as number[] }],
          }}
          width={340}
          height={220}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          style={{ borderRadius: 16 }}
          yAxisLabel="₹"
          yAxisSuffix=""
        />
      ),
      render: (item: [string, number]) => (
        <Text style={styles.item}>{item[0]}: ₹{item[1].toFixed(2)}</Text>
      ),
    },
    monthly: {
      title: '📆 Monthly Summary',
      data: Object.entries(monthly),
      chart: (
        <BarChart
          data={{
            labels: Object.keys(monthly),
            datasets: [{ data: Object.values(monthly) as number[] }],
          }}
          width={340}
          height={220}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          style={{ borderRadius: 16 }}
          yAxisLabel="₹"
          yAxisSuffix=""
        />
      ),
      render: (item: [string, number]) => (
        <Text style={styles.item}>{item[0]}: ₹{item[1].toFixed(2)}</Text>
      ),
    },
    yearly: {
      title: '📅 Yearly Summary',
      data: Object.entries(yearly),
      chart: (
        <BarChart
          data={{
            labels: Object.keys(yearly),
            datasets: [{ data: Object.values(yearly) as number[] }],
          }}
          width={340}
          height={220}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          style={{ borderRadius: 16 }}
          yAxisLabel="₹"
          yAxisSuffix=""
        />
      ),
      render: (item: [string, number]) => (
        <Text style={styles.item}>{item[0]}: ₹{item[1].toFixed(2)}</Text>
      ),
    },
    category: {
      title: '📂 Category-wise Summary',
      data: Object.entries(category),
      chart: (
        <PieChart
          data={Object.entries(category).map(([x, y], i) => ({
            name: x,
            population: y as number,
            color: ["#b983ff", "#f3c4fb", "#ff6f91", "#6d597a", "#fff0f6"][i % 5],
            legendFontColor: '#6d597a',
            legendFontSize: 12,
          }))}
          width={340}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={{ borderRadius: 16 }}
        />
      ),
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
          {tabData[selectedTab].chart}
          <FlatList
            data={tabData[selectedTab].data}
            keyExtractor={(item) => item[0]}
            renderItem={({ item }) => tabData[selectedTab].render(item)}
            style={styles.list}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={{ color: '#b983ff', alignSelf: 'center', marginTop: 12 }}>No data found.</Text>}
          />
        </View>

        {/* Admin: Groupwise summary */}
        {appUser.role === 'admin' && groupwise.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.header}>Groupwise Expenses</Text>
            <PieChart
              data={groupwise.map((g, i) => ({
                name: g.x,
                population: g.y,
                color: ["#b983ff", "#f3c4fb", "#ff6f91", "#6d597a", "#fff0f6"][i % 5],
                legendFontColor: '#6d597a',
                legendFontSize: 12,
              }))}
              width={340}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={{ borderRadius: 16 }}
            />
            <FlatList
              data={groupwise}
              keyExtractor={(item) => item.x}
              renderItem={({ item }) => (
                <Text style={styles.item}>{item.x}: ₹{item.y.toFixed(2)}</Text>
              )}
              style={styles.list}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={{ color: '#b983ff', alignSelf: 'center', marginTop: 12 }}>No data found.</Text>}
            />
          </View>
        )}
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
