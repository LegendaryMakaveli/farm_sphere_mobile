import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useGetMyFarmCyclesQuery, useGetMyPendingTasksQuery } from '@/store/api/farmingApi';
import { Map, Calendar, AlertCircle, ArrowRight, Sprout, Activity, Clock } from 'lucide-react-native';

export function MyPlotScreen({ navigation }) {
  const { data: cyclesResponse, isLoading: isLoadingCycles, error: cyclesError, refetch } = useGetMyFarmCyclesQuery();
  const { data: tasksResponse, isLoading: isLoadingTasks } = useGetMyPendingTasksQuery();

  const cycles = cyclesResponse?.data || [];
  const pendingTasks = tasksResponse?.data || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#f0fdf4', text: '#166534', border: '#dcfce7' };
      case 'PENDING': return { bg: '#fffbeb', text: '#92400e', border: '#fef3c7' };
      case 'COMPLETED': return { bg: '#eff6ff', text: '#1e40af', border: '#dbeafe' };
      default: return { bg: '#f8fafc', text: '#475569', border: '#f1f5f9' };
    }
  };

  const renderCycleItem = ({ item }) => {
    const status = getStatusColor(item.status);
    const plotTasks = pendingTasks.filter(t => t.farmCycleId === item.id);

    // Calculate Progress and Week
    const now = new Date();
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    const totalDuration = end - start;
    const elapsed = now - start;
    const progressPercent = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100) || 0;
    const currentWeek = Math.max(Math.ceil(elapsed / (7 * 24 * 60 * 60 * 1000)), 1);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => alert(`Viewing Cycle for ${item.cropPlan?.crop?.name}. Detailed view coming soon.`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.iconCircle}>
              <Sprout color="#16a34a" size={20} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Plot #{item.plotId ? item.plotId.toString().split('-')[0].toUpperCase() : 'PL-01'}</Text>
              <Text style={styles.cropName}>{item.cropPlan?.crop?.name || 'Unassigned Crop'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Calendar color="#64748b" size={14} />
            <Text style={styles.metricText}>Ends {new Date(item.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</Text>
          </View>
          <View style={styles.metric}>
            <Activity color="#64748b" size={14} />
            <Text style={styles.metricText}>{plotTasks.length} Tasks Left</Text>
          </View>
          <View style={styles.metric}>
            <Clock color="#64748b" size={14} />
            <Text style={styles.metricText}>Week {currentWeek}</Text>
          </View>
        </View>

        <View style={styles.taskPreview}>
          <View style={styles.progressBar}>
             <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>Cycle Progress</Text>
            <Text style={styles.progressValue}>{progressPercent}%</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Manage tasks & health</Text>
          <ArrowRight color="#16a34a" size={16} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Plots</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={refetch}>
          <Activity color="#64748b" size={20} />
        </TouchableOpacity>
      </View>

      {isLoadingCycles ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Syncing farm data...</Text>
        </View>
      ) : cyclesError ? (
        <View style={styles.center}>
          <AlertCircle color="#ef4444" size={48} />
          <Text style={styles.errorText}>Failed to load farm cycles</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Retry Sync</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cycles}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderCycleItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Map color="#94a3b8" size={40} />
              </View>
              <Text style={styles.emptyTitle}>No Plots Assigned</Text>
              <Text style={styles.emptyDesc}>Contact your administrator to have plots assigned to your profile.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfd' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 15 },
  errorText: { marginTop: 12, fontSize: 16, color: '#ef4444', fontWeight: '600' },
  retryBtn: { marginTop: 20, backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#fff', fontWeight: '700' },

  listContent: { padding: 24, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 20, marginBottom: 20, shadowColor: '#64748b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  cropName: { fontSize: 13, color: '#64748b', marginTop: 2 },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  
  metricsRow: { flexDirection: 'row', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  
  taskPreview: { marginBottom: 20 },
  progressBar: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginBottom: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#16a34a', borderRadius: 3 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  progressValue: { fontSize: 11, color: '#16a34a', fontWeight: '800' },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
  
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 }
});
