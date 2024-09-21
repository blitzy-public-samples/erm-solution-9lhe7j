import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole } from 'src/shared/types/index';
import { api } from 'src/frontend/services/api';
import { auth } from 'src/frontend/services/auth';

// Define the initial state
interface UserState {
  currentUser: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  status: 'idle',
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const login = createAsyncThunk<User, { email: string; password: string }>(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const user = await auth.login(credentials);
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await auth.logout();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<User>(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await api.get<User>('/users/me');
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk<User, Partial<User>>(
  'user/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const updatedUser = await api.put<User>('/users/me', profileData);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user profile');
    }
  }
);

export const changePassword = createAsyncThunk<void, { currentPassword: string; newPassword: string }>(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      await api.post('/users/change-password', passwordData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

// Create the slice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.error = null;
      });
  },
});

// Export actions
export const { setUser, clearUser } = userSlice.actions;

// Export selectors
export const userSelectors = {
  selectCurrentUser: (state: { user: UserState }) => state.user.currentUser,
  selectIsAuthenticated: (state: { user: UserState }) => state.user.isAuthenticated,
  selectUserStatus: (state: { user: UserState }) => state.user.status,
  selectUserError: (state: { user: UserState }) => state.user.error,
};

// Export reducer
export default userSlice.reducer;