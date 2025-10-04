import { useDelivery, getDeliveryLabel } from '../context/DeliveryContext';
// src/screens/Report.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, Image, TouchableOpacity, Animated } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { ScreenBackground } from '../components/ScreenBackground';
import { commonStyles } from '../theme/commonStyles';
const CuteDemon = require('../../assets/mydemon/cute-demon.png');
import { useExpenseReport } from '../hooks/useExpenseReport';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../theme/ThemeContext';



export default function ReportScreen({ navigation }: any) {
  const { deliveryStatus, items } = useDelivery();
  const today = new Date();

  // Move selectedTab state above logic that uses it
  const [selectedTab, setSelectedTab] = useState<'daily' | 'monthly' | 'yearly' | 'category'>('daily');
  const [groups, setGroups] = useState<{ id: string, name: string, members: string[] }[]>([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const { appUser } = useAuth();
  const theme = useTheme();
  // Fetch groups for user/admin
    useEffect(() => {
        const fetchGroups = async () => {
          setGroupLoading(true);
          if (!appUser) return;
          
          setGroups(appUser.groupIds ? appUser.groupIds.map(gid => ({ id: gid, name: gid, members: [] })) : []);
          if (appUser.groupIds.length > 0) setSelectedGroupId(appUser.groupIds[0]);
          setGroupLoading(false);
        };
        fetchGroups();
      }, [appUser]);

  // Delivery/Service Report logic (must be after selectedTab is defined)
  let reportLabel = '';
  let deliveryCounts: { id: string; name: string; label: string; count: number }[] = [];
  let totalDeliveries = 0;
  if (selectedTab === 'daily') {
    const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
    reportLabel = `for ${dateStr}`;
    deliveryCounts = items.map(item => {
      const count = deliveryStatus[selectedGroupId]?.[dateStr]?.[item.id] === 'delivered' ? 1 : 0;
      return { id: item.id, name: item.name, label: getDeliveryLabel(item.id), count };
    });
    totalDeliveries = deliveryCounts.reduce((sum, d) => sum + d.count, 0);
  } else if (selectedTab === 'monthly') {
    const monthStr = today.toLocaleString('default', { month: 'long' });
    const yearStr = today.getFullYear();
    reportLabel = `for ${monthStr} ${yearStr}`;
    const monthKey = today.toISOString().slice(0, 7); // YYYY-MM
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const allDates = Array.from({ length: daysInMonth }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, '0')}`);
    deliveryCounts = items.map(item => {
      let count = 0;
      allDates.forEach(date => {
        if (deliveryStatus[selectedGroupId]?.[date]?.[item.id] === 'delivered') count++;
      });
      return { id: item.id, name: item.name, label: getDeliveryLabel(item.id), count };
    });
    totalDeliveries = deliveryCounts.reduce((sum, d) => sum + d.count, 0);
  } else if (selectedTab === 'yearly') {
    const yearStr = today.getFullYear();
    reportLabel = `for ${yearStr}`;
    const allDates: string[] = [];
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(today.getFullYear(), m + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        allDates.push(`${yearStr}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      }
    }
    deliveryCounts = items.map(item => {
      let count = 0;
      allDates.forEach(date => {
        if (deliveryStatus[selectedGroupId]?.[date]?.[item.id] === 'delivered') count++;
      });
      return { id: item.id, name: item.name, label: getDeliveryLabel(item.id), count };
    });
    totalDeliveries = deliveryCounts.reduce((sum, d) => sum + d.count, 0);
  }
  
  const { daily, monthly, yearly, category, expenses, loading, error } = useExpenseReport((!groupLoading && selectedGroupId) ? selectedGroupId : null);

  // Premium: Show only last 5 days, fetch more on scroll
  const [visibleDays, setVisibleDays] = useState(5);
  const dailyKeys = useMemo(() => Object.keys(daily).sort((a, b) => b.localeCompare(a)), [daily]); // newest first
  const visibleDailyKeys = dailyKeys.slice(0, visibleDays);
  const handleLoadMoreDays = () => {
    if (visibleDays < dailyKeys.length) setVisibleDays(v => Math.min(v + 5, dailyKeys.length));
  };
  // Animation for premium look
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim, selectedTab, visibleDays]);
  

  // (removed duplicate selectedTab declaration)
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
      data: visibleDailyKeys.map(key => [key, daily[key]]),
      chart: (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
          <BarChart
            data={{
              labels: visibleDailyKeys.map(k => k.slice(5)),
              datasets: [{ data: visibleDailyKeys.map(k => daily[k]) }],
            }}
            width={Math.max(340, visibleDailyKeys.length * 60)}
            height={220}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={{ borderRadius: 20 }}
            yAxisLabel="₹"
            yAxisSuffix=""
          />
        </ScrollView>
      ),
      render: (item: [string, number]) => (
        <View style={styles.premiumCard}>
          <Text style={styles.premiumDate}>{item[0]}</Text>
          <Text style={styles.premiumAmount}>₹{item[1].toFixed(2)}</Text>
        </View>
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
      <Animated.ScrollView style={{ width: '100%', opacity: fadeAnim }} contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}>
        <Image source={CuteDemon} style={commonStyles.cuteImage} />
        <Text style={[commonStyles.title, { color: '#b983ff', letterSpacing: 1 }]}>Expense Report</Text>
        {groupLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginBottom: 16 }} />
        ) : groups.length > 1 ? (
          <View style={commonStyles.pickerWrapper}>
            <Picker
              selectedValue={selectedGroupId}
              style={commonStyles.picker}
              onValueChange={setSelectedGroupId}
            >
              {groups.map(g => (
                <Picker.Item key={g.id} label={g.name} value={g.id} />
              ))}
            </Picker>
          </View>
        ) : groups.length === 1 ? (
              <Text style={{ marginBottom: 8, fontWeight: 'bold', display: 'none' }}>Group: {groups[0].name}</Text>
            ):
            (
          <Text style={{ color: theme.colors.error, marginBottom: 12 }}>No groups found.</Text>
        )}
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
        <View style={styles.sectionCardPremium}>
          <Text style={styles.header}>{tabData[selectedTab].title}</Text>
          {tabData[selectedTab].chart}
          <FlatList
            data={tabData[selectedTab].data as [string, number][]}
            keyExtractor={(item) => String(item[0])}
            renderItem={({ item }) => tabData[selectedTab].render(item as [string, number])}
            style={styles.list}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={{ color: '#b983ff', alignSelf: 'center', marginTop: 12 }}>No data found.</Text>}
          />
          {selectedTab === 'daily' && visibleDays < dailyKeys.length && (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMoreDays}>
              <Text style={styles.loadMoreText}>Show More Days</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Delivery/Service Report for selected tab */}
        <View style={styles.sectionCard}>
          <Text style={styles.header}>Delivery/Service Report {reportLabel}</Text>
          <Text style={styles.item}>Total Deliveries/Service Done: {totalDeliveries}</Text>
          {deliveryCounts.map(d => (
            <Text key={d.id} style={styles.item}>{d.label} ({d.name}): {d.count}</Text>
          ))}
        </View>
      </Animated.ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  // container and cuteImage/title styles removed, using commonStyles instead
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 22,
    width: '97%',
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#E0C3FC',
    alignSelf: 'center',
  },
  sectionCardPremium: {
    backgroundColor: 'linear-gradient(135deg, #fff0f6 0%, #f3c4fb 100%)',
    borderRadius: 32,
    padding: 22,
    marginBottom: 26,
    width: '97%',
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#E0C3FC',
    alignSelf: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 12,
    color: '#b983ff',
    alignSelf: 'center',
    letterSpacing: 0.5,
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
  premiumCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginVertical: 6,
    marginHorizontal: 8,
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumDate: {
    fontSize: 16,
    color: '#b983ff',
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  premiumAmount: {
    fontSize: 18,
    color: '#6d597a',
    fontWeight: 'bold',
  },
  list: {
    marginBottom: 12,
  },
  loadMoreBtn: {
    backgroundColor: '#b983ff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
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
