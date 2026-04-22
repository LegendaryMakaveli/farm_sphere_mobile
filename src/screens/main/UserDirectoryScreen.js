import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useGetAllUsersQuery } from '@/store/api/adminApi';
import { Users, ChevronLeft, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export function UserDirectoryScreen() {
  const navigation = useNavigation();
  const { data: usersRes, isLoading } = useGetAllUsersQuery();
  const users = usersRes?.data || [];

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.avatar}>
        <User color="#16a34a" size={24} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.firstName} {item.secondName}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.rolesContainer}>
          {item.roles?.map(role => (
            <View key={role} style={[styles.roleBadge, role === 'ADMIN' && styles.adminBadge]}>
              <Text style={[styles.roleText, role === 'ADMIN' && styles.adminText]}>{role}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Directory</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.center}>
          <Users color="#94a3b8" size={48} />
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptyDesc}>There are no users registered yet.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfd' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  listContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  
  userCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  rolesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  roleText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  adminBadge: { backgroundColor: '#fee2e2' },
  adminText: { color: '#b91c1c' },
});
