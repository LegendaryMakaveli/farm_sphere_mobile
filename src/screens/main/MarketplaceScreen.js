import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  TextInput
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { Store, ShoppingCart, Search, Filter, Info, Package, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useGetAvailableProduceQuery } from '@/store/api/marketplaceApi';

const { width } = Dimensions.get('window');
const CATEGORIES = ['ALL', 'CEREAL', 'PULSES', 'VEGETABLES', 'FRUITS', 'NUTS', 'OILSEEDS', 'SPICES', 'TUBERS', 'OTHER'];

export function MarketplaceScreen() {
  const navigation = useNavigation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [category, setCategory] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { data: yieldProduce, isLoading, isError, refetch } = useGetAvailableProduceQuery();
  
  const filteredProduce = yieldProduce?.data?.filter(p => {
    const matchesCategory = category === 'ALL' || p.category === category;
    const matchesSearch = p.plot?.crop?.name?.toLowerCase().includes(searchText.toLowerCase()) || 
                         p.farmerName?.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const handleOrder = (item) => {
    if (!isAuthenticated) {
      navigation.navigate('Auth');
      return;
    }
    // Add to cart logic here
    alert('Added to cart: ' + (item.plot?.crop?.name || 'Produce Item'));
  };

  const CategoryChip = ({ title, active, onPress }) => (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.chip, active && styles.activeChip]}
    >
      <Text style={[styles.chipText, active && styles.activeChipText]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.imageBox}>
        <View style={styles.badge}>
           <Text style={styles.badgeText}>{item.category}</Text>
        </View>
        <Package color="#16a34a" size={40} strokeWidth={1} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.prodName} numberOfLines={1}>{item.plot?.crop?.name || 'Produce Item'}</Text>
        <Text style={styles.prodFarmer} numberOfLines={1}>by {item.farmerName || 'FarmSphere Direct'}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>$</Text>
          <Text style={styles.priceVal}>{item.pricePerUnit?.toFixed(2)}</Text>
          <Text style={styles.priceUnit}>/{item.unit}</Text>
        </View>

        <View style={styles.stockInfo}>
          <View style={styles.stockIndicator} />
          <Text style={styles.stockText}>{item.quantityAvailable} {item.unit} in stock</Text>
        </View>

        <TouchableOpacity style={styles.orderBtn} onPress={() => handleOrder(item)}>
           <ShoppingCart color="#fff" size={14} style={{marginRight: 6}} />
           <Text style={styles.orderBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.searchBar}>
          <Search color="#94a3b8" size={18} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search farm fresh produce..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X color="#94a3b8" size={16} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[styles.filterBtn, isFilterOpen && styles.activeFilterBtn]} onPress={() => setIsFilterOpen(!isFilterOpen)}>
          <Filter color={isFilterOpen ? "#16a34a" : "#334155"} size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartIconBtn}>
           <ShoppingCart color="#334155" size={24} />
           <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>0</Text></View>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {CATEGORIES.map(cat => (
            <CategoryChip 
              key={cat} 
              title={cat} 
              active={category === cat} 
              onPress={() => setCategory(cat)} 
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Fetching fresh harvests...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Info color="#ef4444" size={48} />
          <Text style={styles.errorText}>Couldn't load the market right now.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryBtnText}>Refresh Market</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProduce}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.gridRow}
          ListEmptyComponent={
            <View style={styles.emptyMarket}>
              <View style={styles.emptyIconCircle}>
                 <Store color="#94a3b8" size={48} />
              </View>
              <Text style={styles.emptyTitle}>Category Empty</Text>
              <Text style={styles.emptyDesc}>We don't have any {category.toLowerCase()} available right now. Check back soon!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfd' },
  topHeader: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, alignItems: 'center', gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', height: 48, borderRadius: 16, paddingHorizontal: 16, gap: 10 },
  searchInput: { flex: 1, color: '#0f172a', fontSize: 14, paddingVertical: 8 },
  filterBtn: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  activeFilterBtn: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  cartIconBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  
  categoryContainer: { marginBottom: 12 },
  chipScroll: { paddingHorizontal: 20, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
  activeChip: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  activeChipText: { color: '#fff' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 15 },
  errorText: { marginTop: 12, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  retryBtn: { backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: '#fff', fontWeight: '700' },

  gridContent: { padding: 16, paddingBottom: 40 },
  gridRow: { justifyContent: 'space-between', gap: 16 },
  
  card: { backgroundColor: '#fff', width: (width - 48) / 2, borderRadius: 24, padding: 12, marginBottom: 16, shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  imageBox: { height: 120, backgroundColor: '#f8fafc', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  badge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' },
  
  cardInfo: { paddingHorizontal: 4 },
  prodName: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  prodFarmer: { fontSize: 11, color: '#94a3b8', marginBottom: 8 },
  
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  currency: { fontSize: 12, fontWeight: '700', color: '#16a34a', marginRight: 1 },
  priceVal: { fontSize: 18, fontWeight: '800', color: '#16a34a' },
  priceUnit: { fontSize: 11, color: '#94a3b8', marginLeft: 2 },
  
  stockInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 4 },
  stockIndicator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#10b981' },
  stockText: { fontSize: 10, color: '#64748b', fontWeight: '500' },
  
  orderBtn: { backgroundColor: '#16a34a', height: 36, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#16a34a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  orderBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  emptyMarket: { padding: 40, alignItems: 'center' },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#334155', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20 }
});
