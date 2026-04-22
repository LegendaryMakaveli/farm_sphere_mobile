import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { loadCredentials, selectIsAuthenticated, selectIsInitializing, selectIsFarmer, selectIsInvestor } from '@/store/slices/authSlice';
import { Home, Store, Settings, Map, Wallet, ListTodo, Briefcase } from 'lucide-react-native';
import { View, Text, ActivityIndicator } from 'react-native';

import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import { DashboardScreen } from '@/screens/main/DashboardScreen';
import { MarketplaceScreen } from '@/screens/main/MarketplaceScreen';
import { SettingsScreen } from '@/screens/main/SettingsScreen';
import { MyPlotScreen } from '@/screens/main/MyPlotScreen';
import { PortfolioScreen } from '@/screens/main/PortfolioScreen';
import { HistoryScreen } from '@/screens/main/HistoryScreen';
import { PersonalDetailsScreen } from '@/screens/main/PersonalDetailsScreen';
import { FarmerPlansScreen } from '@/screens/main/FarmerPlansScreen';
import { AddProduceScreen } from '@/screens/main/AddProduceScreen';
import { UserDirectoryScreen } from '@/screens/main/UserDirectoryScreen';

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isFarmer = useSelector(selectIsFarmer);
  const isInvestor = useSelector(selectIsInvestor);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = size + 4;
          let icon;
          if (route.name === 'Home') icon = <Home color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Market') icon = <Store color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Settings') icon = <Settings color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Plot') icon = <Map color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
          else if (route.name === 'Portfolio') icon = <Briefcase color={color} size={iconSize} strokeWidth={focused ? 2.5 : 2} />;
          return icon;
        },
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          height: 60,
          paddingTop: 8,
          paddingBottom: 6,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 25,
          shadowColor: '#64748b',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          borderRadius: 16,
          marginHorizontal: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Market" 
        component={MarketplaceScreen} 
        options={{ title: 'Market' }}
      />
      
      <Tab.Screen 
        name="Portfolio" 
        component={PortfolioScreen} 
        options={{ title: 'Invest' }}
      />

      {isAuthenticated && <Tab.Screen name="Home" component={DashboardScreen} />}
      
      {isAuthenticated && isFarmer && <Tab.Screen name="Plot" component={MyPlotScreen} />}
      
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);

  useEffect(() => {
    dispatch(loadCredentials());
  }, [dispatch]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
        <Stack.Screen name="FarmerPlans" component={FarmerPlansScreen} />
        <Stack.Screen name="AddProduce" component={AddProduceScreen} />
        <Stack.Screen name="UserDirectory" component={UserDirectoryScreen} />
        {!isAuthenticated && (
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="Auth" component={AuthStack} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
