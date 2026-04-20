import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Constants from 'expo-constants';

// Use standard Android emulator loopback, or fallback to localhost, or physical device network IP
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.2:8080';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'Profile',
    'Produce',
    'MyProduce',
    'Orders',
    'MyOrders',
    'Assets',
    'Portfolio',
    'Listings',
    'MyListings',
    'CropPlan',
    'FarmCycles',
    'Tasks',
    'MyPlot',
    'Tools',
    'Bookings',
    'MyBookings',
    'PendingFarmers',
    'PendingInvestors',
    'Estates',
    'Clusters',
    'Plots',
    'Crops',
    'CropPlans',
    'AllFarmCycles',
    'AllOrders',
    'AllTools',
    'AllBookings',
  ],
  endpoints: () => ({}),
});
