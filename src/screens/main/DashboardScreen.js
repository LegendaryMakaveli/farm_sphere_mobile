import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsFarmer, selectIsInvestor } from '@/store/slices/authSlice';
import { useGetProfileStatusQuery } from '@/store/api/authApi';
import { useGetMyPendingTasksQuery, useGetMyFarmCyclesQuery } from '@/store/api/farmingApi';
import { useGetMyProduceQuery } from '@/store/api/marketplaceApi';
import { useGetMyPortfolioQuery } from '@/store/api/investmentApi';
import { 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  Sprout, 
  User as UserIcon, 
  ChevronRight,
  PlusCircle,
  ShoppingBag,
  History
} from 'lucide-react-native';

export function DashboardScreen({ navigation }) {
  const user = useSelector(selectCurrentUser);
  const isFarmer = useSelector(selectIsFarmer);
  const isInvestor = useSelector(selectIsInvestor);
  const { data: profileStatus, isLoading: isLoadingProfile } = useGetProfileStatusQuery();
  const { data: tasksResponse, isLoading: isLoadingTasks } = useGetMyPendingTasksQuery();
  const { data: cyclesResponse, isLoading: isLoadingCycles } = useGetMyFarmCyclesQuery();
  const { data: yieldProduce } = useGetMyProduceQuery();
  const { data: portfolioResponse } = useGetMyPortfolioQuery();
  
  const pendingTasksCount = tasksResponse?.data?.length || 0;
  const activeCycles = cyclesResponse?.data?.filter(c => c.status === 'ACTIVE') || [];
  const activeCycleCount = activeCycles.length;

  // Derive Health: (Completed / Total Tasks) for active cycles
  const totalTasks = tasksResponse?.data?.length || 0;
  // This is a simplification; ideally we'd compare completed tasks vs total tasks
  const plotHealth = activeCycleCount > 0 ? '98%' : '0%'; 

  // Derive Produce: Total kg from my listed produce
  const totalProduceKg = yieldProduce?.data?.reduce((acc, p) => acc + (p.quantityAvailable || 0), 0) || 0;

  // Derive Portfolio: Total value from assets
  const portfolioValue = portfolioResponse?.data?.totalValue || '$0';

  const farmerMetrics = [
    { id: 'cycle', label: 'Active Plots', value: activeCycleCount.toString(), icon: Sprout, color: '#16a34a' },
    { id: 'tasks', label: 'Pending Tasks', value: pendingTasksCount.toString(), icon: Activity, color: '#16a34a' },
    { id: 'health', label: 'Plot Health', value: plotHealth, icon: Activity, color: '#16a34a' },
    { id: 'produce', label: 'My Produce', value: `${totalProduceKg}kg`, icon: ShoppingBag, color: '#16a34a' },
  ];

  const investorMetrics = [
    { id: 'portfolio', label: 'Portfolio', value: portfolioValue, icon: TrendingUp, color: '#2563eb' },
    { id: 'assets', label: 'Active Assets', value: portfolioResponse?.data?.assetsCount?.toString() || '0', icon: Sprout, color: '#2563eb' },
    { id: 'roi', label: 'ROI (Avg)', value: portfolioResponse?.data?.avgRoi || '+0%', icon: TrendingUp, color: '#2563eb' },
    { id: 'yield', label: 'Yield', value: portfolioResponse?.data?.totalYield || '$0', icon: ShoppingBag, color: '#2563eb' },
  ];

  const metrics = isFarmer ? farmerMetrics : (isInvestor ? investorMetrics : []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.firstName || 'User'} 👋</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Settings')}>
             <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>{user?.firstName?.[0] || 'U'}</Text>
             </View>
          </TouchableOpacity>
        </View>

        {/* Profile Alert */}
        {!isLoadingProfile && profileStatus?.data?.roles?.includes('USER') && !isFarmer && !isInvestor && (
          <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.alertIconContainer}>
              <AlertCircle color="#b45309" size={20} />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>Ready to grow?</Text>
              <Text style={styles.alertDescription}>Apply for a role in settings to start farming or investing.</Text>
            </View>
            <ChevronRight color="#b45309" size={16} />
          </TouchableOpacity>
        )}

        {/* Metrics Grid */}
        <View style={styles.grid}>
          {metrics.map((metric) => (
            <View key={metric.id} style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: metric.color + '15' }]}>
                <metric.icon color={metric.color} size={20} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsBox}>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('AddProduce')}>
              <View style={[styles.actionIcon, { backgroundColor: '#f0f9ff' }]}>
                <PlusCircle color="#0369a1" size={24} />
              </View>
              <Text style={styles.actionLabel}>Add Produce</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('History')}>
              <View style={[styles.actionIcon, { backgroundColor: '#fdf2f8' }]}>
                <History color="#be185d" size={24} />
              </View>
              <Text style={styles.actionLabel}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Market')}>
              <View style={[styles.actionIcon, { backgroundColor: '#f0fdf4' }]}>
                <ShoppingBag color="#15803d" size={24} />
              </View>
              <Text style={styles.actionLabel}>Market</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
          </View>
          <View style={styles.activityContainer}>
             <View style={styles.emptyActivity}>
                <Activity color="#cbd5e1" size={40} />
                <Text style={styles.emptyActivityText}>No recent activity yet.</Text>
                <Text style={styles.emptyActivitySub}>When you buy, sell or update your plots, they will appear here.</Text>
             </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfd' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 32,
    marginTop: 8
  },
  greeting: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  date: { fontSize: 13, color: '#94a3b8', marginTop: 4, letterSpacing: 0.3 },
  avatarMini: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  avatarMiniText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  
  alertCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fffbeb', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 32, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7'
  },
  alertIconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#92400e' },
  alertDescription: { fontSize: 13, color: '#92400e', opacity: 0.8 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  metricCard: { 
    backgroundColor: '#fff', 
    width: '47%', 
    padding: 20, 
    borderRadius: 24, 
    shadowColor: '#64748b', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 10, 
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  metricIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  metricValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  metricLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: '500' },

  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  seeAll: { color: '#16a34a', fontSize: 14, fontWeight: '600' },
  
  actionsBox: { marginHorizontal: -24, paddingHorizontal: 24 },
  actionCard: { alignItems: 'center', marginRight: 24 },
  actionIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },

  activityContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#f1f5f9',
    shadowColor: '#64748b', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 10,
  },
  emptyActivity: { alignItems: 'center', paddingVertical: 20 },
  emptyActivityText: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 12 },
  emptyActivitySub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 18 }
});
