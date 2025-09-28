import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useExpenseReport } from '../hooks/useExpenseReport';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../theme/ThemeContext';
import { commonStyles } from '../theme/commonStyles';
import { ScreenBackground } from '../components/ScreenBackground';

export default function ExpenseListScreen() {
  const navigation: any = useNavigation();
  const { appUser } = useAuth();
  const theme = useTheme();
  const [groups, setGroups] = useState<{ id: string, name: string, members: string[] }[]>([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [openYears, setOpenYears] = useState<Record<string, boolean>>({});
  const [openMonths, setOpenMonths] = useState<Record<string, Record<string, boolean>>>({});
  const [openDates, setOpenDates] = useState<Record<string, Record<string, Record<string, boolean>>>>({});
  const { expenses, loading, error } = useExpenseReport(selectedGroupId);
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

  if (!appUser || appUser.role !== 'admin') {
    return (
      <ScreenBackground>
        <Text style={styles.errorText}>Access denied. Admins only.</Text>
      </ScreenBackground>
    );
  }
  if (loading) {
    return (
      <ScreenBackground>
        <Image source={theme.images.cuteDemon} style={commonStyles.cuteImage} />
        <Text style={styles.loadingText}>Loading...</Text>
      </ScreenBackground>
    );
  }
  if (error) {
    return (
      <ScreenBackground>
        <Text style={styles.errorText}>{error}</Text>
      </ScreenBackground>
    );
  }

  // Group expenses by year, month, date
  const grouped: Record<string, Record<string, Record<string, typeof expenses>>> = {};
  expenses.forEach(exp => {
    if (!exp.expenseDate) return;
    const d = new Date(exp.expenseDate);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const date = d.getDate().toString().padStart(2, '0');
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = {};
    if (!grouped[year][month][date]) grouped[year][month][date] = [];
    grouped[year][month][date].push(exp);
  });


  const toggleYear = (year: string) => {
    setOpenYears(prev => ({ ...prev, [year]: !prev[year] }));
  };
  const toggleMonth = (year: string, month: string) => {
    setOpenMonths(prev => ({
      ...prev,
      [year]: { ...(prev[year] || {}), [month]: !((prev[year] || {})[month]) },
    }));
  };
  const toggleDate = (year: string, month: string, date: string) => {
    setOpenDates(prev => ({
      ...prev,
      [year]: {
        ...(prev[year] || {}),
        [month]: {
          ...((prev[year] || {})[month] || {}),
          [date]: !(((prev[year] || {})[month] || {})[date]),
        },
      },
    }));
  };

  return (
    <ScreenBackground>
      <View style={styles.glassCard}>
        <Text style={[styles.header, { color: theme.colors.primary }]}>All Expenses (Admin Only)</Text>
        {groupLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginBottom: 16 }} />
        ) : groups.length > 0 ? (
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
        ) : (
          <Text style={{ color: theme.colors.error, marginBottom: 12 }}>No groups found.</Text>
        )}
        {Object.keys(grouped).length === 0 && (
          <Text style={{ color: '#b983ff', alignSelf: 'center', marginTop: 12 }}>No expenses found.</Text>
        )}
        <View style={styles.list}>
          {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(year => (
            <View key={year}>
              <TouchableOpacity onPress={() => toggleYear(year)}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 12, color: '#6d597a' }}>{openYears[year] ? '▼' : '▶'} {year}</Text>
              </TouchableOpacity>
              {openYears[year] && Object.keys(grouped[year]).sort((a, b) => b.localeCompare(a)).map(month => (
                <View key={month} style={{ marginLeft: 12 }}>
                  <TouchableOpacity onPress={() => toggleMonth(year, month)}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 8, color: '#b983ff' }}>{(openMonths[year]?.[month]) ? '▼' : '▶'} {year}-{month}</Text>
                  </TouchableOpacity>
                  {openMonths[year]?.[month] && Object.keys(grouped[year][month]).sort((a, b) => b.localeCompare(a)).map(date => (
                    <View key={date} style={{ marginLeft: 16 }}>
                      <TouchableOpacity onPress={() => toggleDate(year, month, date)}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15, marginTop: 4, color: '#A084CA' }}>{(openDates[year]?.[month]?.[date]) ? '▼' : '▶'} {year}-{month}-{date}</Text>
                      </TouchableOpacity>
                      {openDates[year]?.[month]?.[date] && grouped[year][month][date].map(item => (
                        <View key={item.id} style={styles.expenseRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.item}>{item.title || item.category}: ₹{item.amount} ({(() => { if (!item.expenseDate) return ''; const d = new Date(item.expenseDate); const pad = (n: number) => n.toString().padStart(2, '0'); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; })()})</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => navigation.navigate('EditExpense', { expenseId: item.id })}
                          >
                            <Text style={styles.editText}>Edit</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  glassCard: {
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
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginTop: 18,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    color: '#b983ff',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 8,
    elevation: 2,
    shadowColor: '#b983ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginTop: 4,
  },
  errorText: {
    color: '#E57373',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  loadingText: {
    color: '#b983ff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  item: {
    fontSize: 16,
  },
  editBtn: {
    backgroundColor: '#b983ff',
    padding: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
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
