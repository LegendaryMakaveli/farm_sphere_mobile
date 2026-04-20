import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useListProduceMutation } from '@/store/api/marketplaceApi';
import { useGetMyFarmCyclesQuery } from '@/store/api/farmingApi';
import { ChevronLeft, Package, Tag, DollarSign, List, FileText } from 'lucide-react-native';

export function AddProduceScreen({ navigation }) {
  const [formData, setFormData] = useState({
    plotId: '',
    category: 'VEGETABLES',
    quantityAvailable: '',
    unit: 'KG',
    pricePerUnit: '',
    description: ''
  });

  const { data: cyclesResponse } = useGetMyFarmCyclesQuery();
  const [listProduce, { isLoading }] = useListProduceMutation();

  const handleList = async () => {
    if (!formData.plotId || !formData.quantityAvailable || !formData.pricePerUnit) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await listProduce({
        ...formData,
        quantityAvailable: parseFloat(formData.quantityAvailable),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        dateCreated: new Date().toISOString().split('T')[0]
      }).unwrap();
      Alert.alert('Success', 'Produce listed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.data?.message || 'Failed to list produce');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List Produce</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Market Listings</Text>
          <Text style={styles.introDesc}>Sell your harvest directly to consumers on the FarmSphere marketplace.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Select Plot / Cycle (ID)</Text>
          <View style={styles.inputBox}>
            <List color="#64748b" size={20} />
            <TextInput 
              style={styles.input}
              placeholder="e.g. 123"
              value={formData.plotId}
              onChangeText={(t) => setFormData({...formData, plotId: t})}
            />
          </View>

          <Text style={styles.label}>Quantity</Text>
          <View style={styles.inputBox}>
            <Package color="#64748b" size={20} />
            <TextInput 
              style={styles.input}
              placeholder="e.g. 50"
              keyboardType="numeric"
              value={formData.quantityAvailable}
              onChangeText={(t) => setFormData({...formData, quantityAvailable: t})}
            />
            <Text style={styles.unitText}>{formData.unit}</Text>
          </View>

          <Text style={styles.label}>Price per Unit ($)</Text>
          <View style={styles.inputBox}>
            <DollarSign color="#64748b" size={20} />
            <TextInput 
              style={styles.input}
              placeholder="e.g. 2.50"
              keyboardType="numeric"
              value={formData.pricePerUnit}
              onChangeText={(t) => setFormData({...formData, pricePerUnit: t})}
            />
          </View>

          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputBox, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
            <FileText color="#64748b" size={20} />
            <TextInput 
              style={[styles.input, { height: 80 }]}
              placeholder="e.g. Fresh organic tomatoes harvested today."
              multiline
              value={formData.description}
              onChangeText={(t) => setFormData({...formData, description: t})}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleList} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>List on Marketplace</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfd' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  scrollContent: { padding: 24 },
  intro: { marginBottom: 32 },
  introTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  introDesc: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: -8, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#f1f5f9', gap: 12, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  input: { flex: 1, color: '#0f172a', fontSize: 15 },
  unitText: { fontSize: 14, fontWeight: '700', color: '#94a3b8' },
  submitBtn: { backgroundColor: '#16a34a', height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 16, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
