import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserInfo {
  userName: string | null;
  userEmail: string | null;
  userPicture: string | null;
}

export interface AuthState {
  isSignedIn: boolean;
  userInfo: UserInfo | null;
}

const initialState: AuthState = {
  isSignedIn: false,
  userInfo: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ isSignedIn: boolean; userInfo: UserInfo | null }>) {
      state.isSignedIn = action.payload.isSignedIn;
      state.userInfo = action.payload.userInfo;
    },
    clearAuth(state) {
      state.isSignedIn = false;
      state.userInfo = null;
    }
  }
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
