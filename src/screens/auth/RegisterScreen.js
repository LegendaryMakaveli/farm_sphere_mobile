import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { Leaf, Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Calendar, Users } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker'; // Add Picker

export function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    email: '',
    phoneNumber: '',
    gender: 'MALE',
    age: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const handleNext = () => {
    if (!formData.firstName || !formData.secondName || !formData.email || !formData.phoneNumber) {
      Alert.alert('Error', 'Please fill all fields in step 1');
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!formData.age || !formData.address || !formData.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const payload = {
      ...formData,
      age: parseInt(formData.age, 10),
    };

    try {
      const response = await register(payload).unwrap();
      const responsePayload = response.data || response;
      dispatch(setCredentials(responsePayload));
    } catch (error) {
      // AuthApi or middleware handles error toast
    }
  };

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Leaf color="#fff" size={32} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Step {step} of 2</Text>
          </View>

          <View style={styles.form}>
            {step === 1 ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>First Name</Text>
                  <View style={styles.inputWrapper}>
                    <User color="#64748b" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="John"
                      value={formData.firstName}
                      onChangeText={(text) => updateForm('firstName', text)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Last Name</Text>
                  <View style={styles.inputWrapper}>
                    <User color="#64748b" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Doe"
                      value={formData.secondName}
                      onChangeText={(text) => updateForm('secondName', text)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail color="#64748b" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="john@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email}
                      onChangeText={(text) => updateForm('email', text)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <Phone color="#64748b" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="+234..."
                      keyboardType="phone-pad"
                      value={formData.phoneNumber}
                      onChangeText={(text) => updateForm('phoneNumber', text)}
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={handleNext}>
                  <Text style={styles.actionButtonText}>Continue</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Age</Text>
                    <View style={styles.inputWrapper}>
                      <Calendar color="#64748b" size={20} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="30"
                        keyboardType="numeric"
                        value={formData.age}
                        onChangeText={(text) => updateForm('age', text)}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={formData.gender}
                        onValueChange={(itemValue) => updateForm('gender', itemValue)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Male" value="MALE" />
                        <Picker.Item label="Female" value="FEMALE" />
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Address</Text>
                  <View style={styles.inputWrapper}>
                    <MapPin color="#64748b" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="123 Farm Road, City"
                      value={formData.address}
                      onChangeText={(text) => updateForm('address', text)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock color="#64748b" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Create a secure password"
                      secureTextEntry={!showPassword}
                      value={formData.password}
                      onChangeText={(text) => updateForm('password', text)}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff color="#64748b" size={20} /> : <Eye color="#64748b" size={20} />}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock color="#64748b" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      secureTextEntry={!showPassword}
                      value={formData.confirmPassword}
                      onChangeText={(text) => updateForm('confirmPassword', text)}
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.actionButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.registerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 40 },
  backButton: { position: 'absolute', top: 16, left: 16, zIndex: 10, padding: 8 },
  backText: { color: '#64748b', fontSize: 16, fontWeight: '500' },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 24 },
  logoContainer: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#166534', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b' },
  form: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#f8fafc', height: 52 },
  pickerWrapper: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', height: 52, justifyContent: 'center', overflow: 'hidden' },
  picker: { width: '100%', height: 52 },
  inputIcon: { marginRight: 10 },
  eyeIcon: { padding: 8, marginLeft: 4 },
  input: { flex: 1, height: '100%', fontSize: 16, color: '#0f172a' },
  actionButton: { backgroundColor: '#16a34a', borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  actionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: '#64748b', fontSize: 15 },
  registerLink: { color: '#16a34a', fontSize: 15, fontWeight: '600' },
});
