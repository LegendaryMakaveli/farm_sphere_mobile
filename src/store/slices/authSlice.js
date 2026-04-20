import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

export const loadCredentials = createAsyncThunk(
  'auth/loadCredentials',
  async () => {
    const userStr = await SecureStore.getItemAsync('farmsphere_user');
    const token = await SecureStore.getItemAsync('farmsphere_token');
    if (userStr && token) {
      return { user: JSON.parse(userStr), token };
    }
    return null;
  }
);

export const saveCredentials = createAsyncThunk(
  'auth/saveCredentials',
  async (payload, { dispatch, getState }) => {
    // state will be updated via slice reducers first
    const { token, user } = getState().auth;
    await SecureStore.setItemAsync('farmsphere_token', token);
    await SecureStore.setItemAsync('farmsphere_user', JSON.stringify(user));
  }
);

export const removeCredentials = createAsyncThunk(
  'auth/removeCredentials',
  async () => {
    await SecureStore.deleteItemAsync('farmsphere_token');
    await SecureStore.deleteItemAsync('farmsphere_user');
  }
);

const initialState = {
  user: null,
  token: null,
  roles: [],
  profileStatus: null,
  isAuthenticated: false,
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentialsSync: (state, action) => {
      const payload = action.payload;
      // Handle potential nesting (ApiResponse.data)
      const data = payload.data || payload;
      
      state.token = data.token || state.token;
      
      // Merge user data
      state.user = { 
        ...state.user, 
        ...data,
        roles: data.roles ? [...data.roles] : (state.user?.roles || [])
      };
      
      state.roles = state.user.roles || [];
      state.profileStatus = state.user.profileStatus || null;
      state.isAuthenticated = true;
    },

    updateProfileStatusSync: (state, action) => {
      state.profileStatus = action.payload;
      if (state.user) {
        state.user.profileStatus = action.payload;
      }
    },

    updateRoles: (state, action) => {
      state.roles = [...action.payload];
    },

    logoutSync: (state) => {
      state.user = null;
      state.token = null;
      state.roles = [];
      state.profileStatus = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCredentials.fulfilled, (state, action) => {
      if (action.payload) {
        const { user, token } = action.payload;
        state.user = user;
        state.token = token;
        state.roles = user.roles || [];
        state.profileStatus = user.profileStatus || null;
        state.isAuthenticated = true;
      }
      state.isInitializing = false;
    });
    builder.addCase(loadCredentials.rejected, (state) => {
      state.isInitializing = false;
    });
  }
});

export const { setCredentialsSync, updateProfileStatusSync, updateRoles, logoutSync } = authSlice.actions;

export const setCredentials = (payload) => async (dispatch) => {
  dispatch(setCredentialsSync(payload));
  dispatch(saveCredentials());
};

export const updateProfileStatus = (status) => async (dispatch) => {
  dispatch(updateProfileStatusSync(status));
  dispatch(saveCredentials());
};

export const logout = () => async (dispatch) => {
  dispatch(logoutSync());
  dispatch(removeCredentials());
};

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitializing = (state) => state.auth.isInitializing;
export const selectRoles = (state) => state.auth.roles;
export const selectProfileStatus = (state) => state.auth.profileStatus;
export const selectIsFarmer = (state) => state.auth.roles.includes('FARMER');
export const selectIsInvestor = (state) => state.auth.roles.includes('INVESTOR');
export const selectIsAdmin = (state) => state.auth.roles.includes('ADMIN');
export const selectIsUser = (state) => state.auth.roles.includes('USER');

export default authSlice.reducer;
