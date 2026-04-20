import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useGetAllCropPlansQuery } from '@/store/api/adminApi';
import { ChevronLeft, Sprout, ShieldCheck, TrendingUp, Info } from 'lucide-react-native';

export function FarmerPlansScreen({ navigation }) {
  const { data: plansResponse, isLoading, isError, refetch } = useGetAllCropPlansQuery();
  const plans = plansResponse?.data || [];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.planCard} onPress={() => alert('Join Plan coming soon')}>
      <View style={styles.planHeader}>
        <View style={styles.iconBox}>
          <Sprout color="#16a34a" size={24} strokeWidth={2.5} />
        </View>
        <View style={styles.titleInfo}>
          <Text style={styles.planName}>{item.crop?.name || 'Crop Plan'}</Text>
          <Text style={styles.planDuration}>{item.durationWeeks || 12} Weeks Cycle</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>Join</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statLine}>
          <TrendingUp color="#94a3b8" size={14} />
          <Text style={styles.statLabel}>Expected Yield: </Text>
          <Text style={styles.statValue}>{item.expectedYield} {item.yieldUnit}</Text>
        </View>
        <View style={styles.statLine}>
          <ShieldCheck color="#94a3b8" size={14} />
          <Text style={styles.statLabel}>Risk Level: </Text>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>Low</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Info color="#2563eb" size={14} />
        <Text style={styles.footerText}>Required Spacing: {item.spacingX} x {item.spacingY}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Farmer Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.introTitle}>Choose a Farm Plan</Text>
        <Text style={styles.introDesc}>Select a verified crop package to start your next farming cycle with FarmSphere.</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Couldn't load farmer plans.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Sprout color="#cbd5e1" size={48} />
              <Text style={styles.emptyTitle}>No Plans Available</Text>
              <Text style={styles.emptyDesc}>Check back later for new farming opportunities.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfd' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  intro: { padding: 24, paddingBottom: 8 },
  introTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  introDesc: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  listContent: { padding: 20 },
  planCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  titleInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  planDuration: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  priceBadge: { backgroundColor: '#16a34a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  priceText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsRow: { marginBottom: 16, gap: 8 },
  statLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { fontSize: 13, color: '#64748b' },
  statValue: { fontSize: 13, fontWeight: '700', color: '#334155' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerText: { fontSize: 12, color: '#2563eb', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 15 },
  errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: '#fff', fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40 }
});
