import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  sidebarMobileOpen: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },
    setMobileSidebarOpen: (state, action) => {
      state.sidebarMobileOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  toggleSidebar, setSidebarOpen,
  toggleMobileSidebar, setMobileSidebarOpen,
  setTheme, toggleTheme,
} = uiSlice.actions;

export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectMobileSidebarOpen = (state) => state.ui.sidebarMobileOpen;
export const selectTheme = (state) => state.ui.theme;

export default uiSlice.reducer;
