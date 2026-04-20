import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  HelpCircle, 
  Key,
  Briefcase
} from 'lucide-react-native';

import { 
  useUpgradeToFarmerMutation, 
  useUpgradeToInvestorMutation, 
  useGetProfileStatusQuery 
} from '@/store/api/authApi';
import { 
  selectCurrentUser, 
  logout, 
  selectRoles,
  selectIsFarmer,
  selectIsInvestor
} from '@/store/slices/authSlice';

import { useNavigation } from '@react-navigation/native';

export function SettingsScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(selectCurrentUser);
  const roles = useSelector(selectRoles) || [];
  const isFarmer = useSelector(selectIsFarmer);
  const isInvestor = useSelector(selectIsInvestor);
  const isAuthenticated = !!user;

  const { data: profileStatusRes } = useGetProfileStatusQuery(undefined, { skip: !isAuthenticated });
  const liveStatus = profileStatusRes?.data || user?.profileStatus;

  const [upgradeToFarmer] = useUpgradeToFarmerMutation();
  const [upgradeToInvestor] = useUpgradeToInvestorMutation();

  const calculateCompletion = () => {
    if (!user) return 0;
    const fields = ['firstName', 'secondName', 'phoneNumber', 'address'];
    const filled = fields.filter(f => !!user[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  const profileCompletion = calculateCompletion();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: () => dispatch(logout()), style: 'destructive' }
      ]
    );
  };

  const handleUpgradeFarmer = () => {
    Alert.alert(
      'Join Farmer Program',
      'Select your farming experience level to apply:',
      [
        { text: 'Beginner', onPress: () => submitFarmerUpgrade('BEGINNER') },
        { text: 'Intermediate', onPress: () => submitFarmerUpgrade('INTERMEDIATE') },
        { text: 'Experienced', onPress: () => submitFarmerUpgrade('EXPERIENCED') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const submitFarmerUpgrade = async (experienceLevel) => {
    try {
      await upgradeToFarmer({ 
        experienceLevel,
        dateCreated: new Date().toISOString().split('T')[0]
      }).unwrap();
      Alert.alert('Success', 'Your application to join the Farmer Program has been submitted and is pending review.');
    } catch (err) {
      Alert.alert('Error', err?.data?.message || 'Failed to submit application');
    }
  };

  const handleUpgradeInvestor = () => {
    Alert.alert(
      'Join Investor Program',
      'Are you sure you want to apply to join the Investor Program?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply', 
          onPress: async () => {
            try {
              await upgradeToInvestor({
                dateCreated: new Date().toISOString().split('T')[0]
              }).unwrap();
              Alert.alert('Success', 'Your application to join the Investor Program has been submitted and is pending review.');
            } catch (err) {
              Alert.alert('Error', err?.data?.message || 'Failed to submit application');
            }
          } 
        }
      ]
    );
  };

  const SettingRow = ({ icon: Icon, title, value, onPress, color = '#64748b', isDestructive = false, disabled = false }) => (
    <TouchableOpacity 
      style={[styles.settingRow, disabled && { opacity: 0.5 }]} 
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.rowIcon, { backgroundColor: isDestructive ? '#fef2f2' : (color + '10') }]}>
        <Icon color={isDestructive ? '#ef4444' : color} size={20} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, isDestructive && { color: '#ef4444' }]}>{title}</Text>
        {value && <Text style={styles.rowValue}>{value}</Text>}
      </View>
      {!isDestructive && !disabled && <ChevronRight color="#cbd5e1" size={16} />}
      {disabled && !isDestructive && <Text style={styles.disabledText}>Locked</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile Header */}
        <View style={styles.profileCard}>
          {isAuthenticated ? (
            <>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>{user?.firstName?.[0] || 'U'}</Text>
              </View>
              <Text style={styles.userName}>{user?.firstName} {user?.secondName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              
              <View style={styles.badgeContainer}>
                {roles.map(role => (
                  <View key={role} style={styles.roleBadge}>
                    <Text style={styles.roleText}>{role}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.guestState}>
              <View style={[styles.avatarLarge, { backgroundColor: '#f1f5f9' }]}>
                <User color="#94a3b8" size={32} />
              </View>
              <Text style={styles.userName}>Guest User</Text>
              <Text style={styles.userEmail}>Sign in to access all features</Text>
              <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Auth')}>
                 <Text style={styles.loginBtnText}>Sign In / Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Completion */}
        {isAuthenticated && (
          <View style={styles.progressSection}>
             <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Profile Completion</Text>
                <Text style={styles.progressPercent}>{profileCompletion}%</Text>
             </View>
             <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${profileCompletion}%` }]} />
             </View>
          </View>
        )}

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.rowContainer}>
            <SettingRow 
              icon={User} 
              title="Personal Info" 
              value="View details" 
              color="#16a34a" 
              onPress={() => isAuthenticated ? navigation.navigate('PersonalDetails') : navigation.navigate('Auth')} 
            />
            <SettingRow icon={Phone} title="Phone Number" value={user?.phoneNumber || 'Not set'} color="#16a34a" />
            <SettingRow icon={MapPin} title="Address" value={user?.address || 'Not set'} color="#16a34a" />
            <SettingRow icon={Key} title="Security" value="Password & Auth" color="#16a34a" />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.rowContainer}>
            <SettingRow icon={Bell} title="Notifications" color="#2563eb" />
            <SettingRow 
              icon={Briefcase} 
              title={isFarmer ? "Farmer Program (Active)" : (liveStatus?.farmerStatus === 'SUBMITTED' ? "Farmer Program (Pending)" : "Join Farmer Program")} 
              color="#2563eb" 
              disabled={isFarmer || liveStatus?.farmerStatus === 'SUBMITTED'}
              onPress={() => isAuthenticated ? handleUpgradeFarmer() : navigation.navigate('Auth')}
            />
            <SettingRow 
              icon={Briefcase} 
              title={isInvestor ? "Investor Program (Active)" : (liveStatus?.investorStatus === 'SUBMITTED' ? "Investor Program (Pending)" : "Join Investor Program")} 
              color="#2563eb" 
              disabled={isInvestor || liveStatus?.investorStatus === 'SUBMITTED'}
              onPress={() => isAuthenticated ? handleUpgradeInvestor() : navigation.navigate('Auth')}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Help & Connect</Text>
          <View style={styles.rowContainer}>
            <SettingRow icon={HelpCircle} title="Help Center" color="#7c3aed" />
            <SettingRow icon={Shield} title="Privacy Policy" color="#7c3aed" />
          </View>
        </View>

        {/* Logout */}
        {isAuthenticated && (
          <View style={[styles.section, { marginBottom: 60 }]}>
            <View style={styles.rowContainer}>
              <SettingRow icon={LogOut} title="Sign Out" onPress={handleLogout} isDestructive />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfd' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 24 },
  
  profileCard: { backgroundColor: '#fff', borderRadius: 32, padding: 24, alignItems: 'center', shadowColor: '#64748b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 24 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  userName: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#94a3b8', marginBottom: 16 },
  badgeContainer: { flexDirection: 'row', gap: 8 },
  roleBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#dcfce7' },
  roleText: { color: '#166534', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  
  progressSection: { marginBottom: 32, paddingHorizontal: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 13, fontWeight: '700', color: '#334155' },
  progressPercent: { fontSize: 13, fontWeight: '800', color: '#16a34a' },
  progressBar: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#16a34a', borderRadius: 4 },

  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, letterSpacing: 0.5 },
  rowContainer: { backgroundColor: '#fff', borderRadius: 24, padding: 8, shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#f1f5f9' },
  
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#334155' },
  rowValue: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  guestState: { alignItems: 'center', paddingVertical: 10 },
  loginBtn: { marginTop: 20, backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  loginBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  disabledText: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }
});
