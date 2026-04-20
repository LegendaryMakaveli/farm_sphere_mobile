import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { ChevronLeft, User, Phone, Mail, MapPin, Calendar, Shield } from 'lucide-react-native';

export function PersonalDetailsScreen({ navigation }) {
  const user = useSelector(selectCurrentUser);

  const DetailItem = ({ icon: Icon, label, value }) => (
    <View style={styles.detailItem}>
      <View style={styles.iconBox}>
        <Icon color="#16a34a" size={20} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'Not set'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{user?.firstName?.[0] || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.firstName} {user?.secondName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.card}>
            <DetailItem icon={User} label="First Name" value={user?.firstName} />
            <DetailItem icon={User} label="Last Name" value={user?.secondName} />
            <DetailItem icon={Mail} label="Email Address" value={user?.email} />
            <DetailItem icon={Phone} label="Phone Number" value={user?.phoneNumber} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Security</Text>
          <View style={styles.card}>
            <DetailItem icon={MapPin} label="Home Address" value={user?.address} />
            <DetailItem icon={Shield} label="Account Type" value={user?.roles?.join(', ')} />
            <DetailItem icon={Calendar} label="Member Since" value={new Date(user?.createdAt).toLocaleDateString()} />
          </View>
        </View>

        <TouchableOpacity style={styles.editBtn}>
           <Text style={styles.editBtnText}>Edit Details (Coming Soon)</Text>
        </TouchableOpacity>
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
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '700' },
  userName: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#94a3b8' },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  
  detailItem: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textContainer: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2, fontWeight: '500' },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#334155' },
  
  editBtn: { backgroundColor: '#f1f5f9', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  editBtnText: { fontSize: 14, color: '#64748b', fontWeight: '700' }
});
