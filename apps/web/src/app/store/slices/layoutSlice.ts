import { createSlice } from '@reduxjs/toolkit';

interface LayoutState {
  isMobileNavOpen: boolean;
  isSidebarCollapsed: boolean;
}

const initialState: LayoutState = {
  isMobileNavOpen: false,
  isSidebarCollapsed: false,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleMobileNav: (state) => {
      state.isMobileNavOpen = !state.isMobileNavOpen;
    },
    closeMobileNav: (state) => {
      state.isMobileNavOpen = false;
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
  },
});

export const { toggleMobileNav, closeMobileNav, toggleSidebar } =
  layoutSlice.actions;
export default layoutSlice.reducer;
