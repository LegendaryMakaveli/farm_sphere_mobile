import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useGetMyOrdersQuery } from '@/store/api/marketplaceApi';
import { useGetMyFarmCyclesQuery } from '@/store/api/farmingApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { ChevronLeft, ShoppingBag, Map, Sprout, ArrowRight, Activity } from 'lucide-react-native';

export function HistoryScreen({ navigation }) {
  const { data: ordersResponse } = useGetMyOrdersQuery();
  const { data: cyclesResponse } = useGetMyFarmCyclesQuery();

  // Combine and sort by date
  const activities = [
    ...(ordersResponse?.data?.map(o => ({ ...o, type: 'ORDER', date: o.dateCreated || o.createdAt })) || []),
    ...(cyclesResponse?.data?.map(c => ({ ...c, type: 'CYCLE', date: c.dateCreated || c.createdAt })) || [])
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderItem = ({ item }) => {
    const isOrder = item.type === 'ORDER';
    const Icon = isOrder ? ShoppingBag : Map;
    const color = isOrder ? '#2563eb' : '#16a34a';

    return (
      <TouchableOpacity style={styles.activityCard}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          <Icon color={color} size={20} />
        </View>
        <View style={styles.content}>
          <Text style={styles.activityTitle}>
            {isOrder ? `Ordered ${item.produce?.plot?.crop?.name || 'Produce'}` : `Joined ${item.cropPlan?.crop?.name || 'Farm Cycle'}`}
          </Text>
          <Text style={styles.activityDate}>
            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.statusBox}>
          <Text style={[styles.statusText, { color }]}>{item.status}</Text>
          <ArrowRight color="#cbd5e1" size={16} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity History</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Activity color="#cbd5e1" size={48} />
            <Text style={styles.emptyTitle}>No Activity Yet</Text>
            <Text style={styles.emptyDesc}>Your transactions and farming updates will appear here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfd' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  listContent: { padding: 20 },
  activityCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  content: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  activityDate: { fontSize: 12, color: '#94a3b8' },
  statusBox: { alignItems: 'flex-end', flexDirection: 'row', gap: 8 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', paddingVertical: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40 }
});
