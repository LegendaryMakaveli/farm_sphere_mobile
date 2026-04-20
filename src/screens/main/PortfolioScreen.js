import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { useGetMyPortfolioQuery, useGetOpenAssetsQuery } from '@/store/api/investmentApi';
import { Wallet, Briefcase, TrendingUp, Filter, ArrowUpRight, Clock, CheckCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const STATUSES = ['ALL', 'ACTIVE', 'COMPLETED', 'PENDING'];

export function PortfolioScreen() {
  const navigation = useNavigation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [view, setView] = useState(isAuthenticated ? 'MY' : 'OPEN'); // 'MY' or 'OPEN'
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const { data: portfolioResponse, isLoading: isLoadingMy, isError: isErrorMy, refetch: refetchMy } = useGetMyPortfolioQuery(undefined, { skip: !isAuthenticated || view === 'OPEN' });
  const { data: openAssetsResponse, isLoading: isLoadingOpen, isError: isErrorOpen, refetch: refetchOpen } = useGetOpenAssetsQuery(undefined, { skip: view === 'MY' });

  const portfolio = portfolioResponse?.data || [];
  const openAssets = openAssetsResponse?.data || [];
  
  const isLoading = view === 'MY' ? isLoadingMy : isLoadingOpen;
  const isError = view === 'MY' ? isErrorMy : isErrorOpen;
  const refetch = view === 'MY' ? refetchMy : refetchOpen;
  
  const displayData = view === 'MY' ? portfolio : openAssets;
  const filteredData = displayData.filter(asset => 
    statusFilter === 'ALL' || asset.status === statusFilter
  );

  const totalInvested = portfolio.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalReturns = totalInvested * 0.12;

  const StatusChip = ({ title, active, onPress }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.chip, active && styles.activeChip]}
    >
      <Text style={[styles.chipText, active && styles.activeChipText]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const isInvestment = view === 'MY';
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => !isAuthenticated ? navigation.navigate('Auth') : alert('Asset details coming soon')}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, !isInvestment && { backgroundColor: '#f0fdf4' }]}>
            <Briefcase color={isInvestment ? "#2563eb" : "#16a34a"} size={20} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.assetName} numberOfLines={1}>
              {item.name || item.plot?.crop?.name || 'Investment Pool'}
            </Text>
            <Text style={styles.assetDate}>
              {isInvestment ? (item.status === 'COMPLETED' ? 'Matured' : 'Matures Nov 2024') : 'Open for investment'}
            </Text>
          </View>
          <View style={[styles.statusBadge, item.status === 'COMPLETED' && styles.completedBadge]}>
            <Text style={[styles.statusText, item.status === 'COMPLETED' && styles.completedStatusText]}>
              {item.status || (isInvestment ? 'ACTIVE' : 'OPEN')}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{isInvestment ? 'Your Stake' : 'Price / Token'}</Text>
            <Text style={styles.statValue}>${(isInvestment ? item.amount : item.pricePerToken)?.toLocaleString()}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Expected ROI</Text>
            <Text style={styles.roiValue}>+{item.expectedROI || item.roiOverride || 15}%</Text>
          </View>
          <View style={styles.statBox}>
             <Text style={styles.statLabel}>{isInvestment ? 'Est. Payout' : 'Available'}</Text>
             <Text style={styles.statValue}>
               {isInvestment 
                 ? `$${(item.amount * (1 + (item.expectedROI/100))).toLocaleString()}`
                 : `${item.totalTokens - (item.soldTokens || 0)} Tokens`}
             </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
               <View style={[styles.progressPin, { width: isInvestment ? (item.status === 'COMPLETED' ? '100%' : '45%') : `${((item.soldTokens || 0) / item.totalTokens) * 100}%`, backgroundColor: isInvestment ? '#2563eb' : '#16a34a' }]} />
            </View>
            <Text style={styles.progressLabel}>
              {isInvestment 
                ? (item.status === 'COMPLETED' ? '100% Payout' : '45% to Payout')
                : `${Math.round(((item.soldTokens || 0) / item.totalTokens) * 100)}% Funded`}
            </Text>
          </View>
          <TouchableOpacity style={[styles.detailsBtn, !isInvestment && { backgroundColor: '#f0fdf4' }]} onPress={() => !isAuthenticated ? navigation.navigate('Auth') : null}>
            <Text style={[styles.btnTextSmall, { color: isInvestment ? '#2563eb' : '#16a34a' }]}>{isInvestment ? 'View' : 'Invest'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>{view === 'MY' ? 'My Portfolio' : 'Investments'}</Text>
          {isAuthenticated && (
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, view === 'MY' && styles.activeToggle]} 
                onPress={() => setView('MY')}
              >
                <Text style={[styles.toggleText, view === 'MY' && styles.activeToggleText]}>My</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, view === 'OPEN' && styles.activeToggle]} 
                onPress={() => setView('OPEN')}
              >
                <Text style={[styles.toggleText, view === 'OPEN' && styles.activeToggleText]}>Explore</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {view === 'MY' && isAuthenticated && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
               <View>
                  <Text style={styles.summaryLabel}>Total Equity</Text>
                  <Text style={styles.summaryMainValue}>${totalInvested.toLocaleString()}</Text>
               </View>
               <View style={styles.summaryIconBox}>
                  <Wallet color="#fff" size={24} />
               </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.returnsRow}>
               <TrendingUp color="#bfdbfe" size={16} />
               <Text style={styles.returnsText}>Estimated growth: </Text>
               <Text style={styles.returnsValue}>+${totalReturns.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {view === 'OPEN' && (
          <View style={styles.promoCard}>
             <TrendingUp color="#16a34a" size={32} />
             <View style={styles.promoText}>
                <Text style={styles.promoTitle}>Grow your wealth</Text>
                <Text style={styles.promoDesc}>Invest in high-yield fractional farm plots managed by experts.</Text>
             </View>
          </View>
        )}
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUSES.map(s => (
            <StatusChip 
              key={s} 
              title={s} 
              active={statusFilter === s} 
              onPress={() => setStatusFilter(s)} 
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={view === 'MY' ? "#2563eb" : "#16a34a"} />
          <Text style={styles.loadingText}>Loading {view === 'MY' ? 'portfolio' : 'opportunities'}...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Couldn't fetch data. Please try again.</Text>
          <TouchableOpacity style={[styles.retryBtn, view === 'OPEN' && { backgroundColor: '#16a34a' }]} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <TrendingUp color="#94a3b8" size={40} />
              </View>
              <Text style={styles.emptyTitle}>{view === 'MY' ? 'Empty Portfolio' : 'No Assets Found'}</Text>
              <Text style={styles.emptyDesc}>
                {view === 'MY' 
                  ? "You don't have any investments yet. Explore available plots to start."
                  : "We don't have any available investments in this category right now."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfd' },
  topSection: { padding: 24, paddingBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 20 },
  
  summaryCard: { backgroundColor: '#2563eb', borderRadius: 32, padding: 24, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#bfdbfe', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  summaryMainValue: { color: '#ffffff', fontSize: 32, fontWeight: '800' },
  summaryIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  returnsRow: { flexDirection: 'row', alignItems: 'center' },
  returnsText: { color: '#bfdbfe', fontSize: 14, marginLeft: 8 },
  returnsValue: { color: '#fff', fontSize: 14, fontWeight: '700' },

  filterSection: { marginBottom: 12 },
  filterScroll: { paddingHorizontal: 24, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  activeChip: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  activeChipText: { color: '#fff' },

  listContent: { padding: 24, paddingTop: 8, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 20, marginBottom: 20, shadowColor: '#64748b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1 },
  assetName: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  assetDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  statusBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '800', color: '#166534', textTransform: 'uppercase' },
  completedBadge: { backgroundColor: '#f1f5f9' },
  completedStatusText: { color: '#64748b' },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  statBox: { flex: 1 },
  statLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 },
  statValue: { fontSize: 14, fontWeight: '700', color: '#334155' },
  roiValue: { fontSize: 14, fontWeight: '800', color: '#16a34a' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressTrack: { flex: 1, height: 4, backgroundColor: '#f1f5f9', borderRadius: 2, overflow: 'hidden' },
  progressPin: { height: '100%', backgroundColor: '#2563eb', borderRadius: 2 },
  progressLabel: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  detailsBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#f0f7ff', alignItems: 'center', justifyContent: 'center' },
  btnTextSmall: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 15 },
  errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: '#fff', fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  activeToggle: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  activeToggleText: { color: '#0f172a' },
  promoCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  promoText: { flex: 1 },
  promoTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  promoDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 }
});
