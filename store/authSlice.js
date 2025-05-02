import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByEmail, createUser, getUserById, updateUser } from '../api/mockAPI';
import { Alert } from 'react-native';

const initialState = {
  user: null,
  isLoading: true,
};

// Load user from AsyncStorage
export const loadUser = createAsyncThunk('auth/loadUser', async (_, thunkAPI) => {
  try {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      const response = await getUserById(storedUserId);
      if (response.data) return response.data;
      else await AsyncStorage.removeItem('userId');
    }
    return null;
  } catch (error) {
    console.error("Failed to load user from storage", error);
    return null;
  }
});

export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const response = await getUserByEmail(email);
    const foundUser = response.data.find(u => u.email === email);
    if (foundUser && foundUser.password === password) {
      await AsyncStorage.setItem('userId', foundUser.id);
      return foundUser;
    } else {
      Alert.alert("Login Failed", "Invalid email or password.");
      return thunkAPI.rejectWithValue(null);
    }
  } catch (error) {
    Alert.alert("Login Error", "An error occurred during login.");
    return thunkAPI.rejectWithValue(null);
  }
});

export const signup = createAsyncThunk('auth/signup', async ({ email, password, name }, thunkAPI) => {
  try {
    const existingUsers = await getUserByEmail(email);
    if (existingUsers.data.length > 0) {
      Alert.alert("Signup Failed", "Email already in use.");
      return thunkAPI.rejectWithValue(null);
    }

    const newUser = { email, password, name, registeredEvents: [] };
    const response = await createUser(newUser);
    if (response.data) {
      await AsyncStorage.setItem('userId', response.data.id);
      return response.data;
    }

    return thunkAPI.rejectWithValue(null);
  } catch (error) {
    Alert.alert("Signup Error", "An error occurred during signup.");
    return thunkAPI.rejectWithValue(null);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('userId');
  return null;
});

export const updateUserRegisteredEvents = createAsyncThunk(
  'auth/updateRegisteredEvents',
  async (newRegisteredEventsList, { getState }) => {
    const { user } = getState().auth;
    if (!user) return null;

    try {
      const updatedUserData = { ...user, registeredEvents: newRegisteredEventsList };
      const response = await updateUser(user.id, updatedUserData);
      return response.data;
    } catch (error) {
      console.error("Failed to update user registered events:", error);
      return user;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(loadUser.rejected, state => {
        state.isLoading = false;
      })
      .addCase(login.pending, state => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(login.rejected, state => {
        state.isLoading = false;
      })
      .addCase(signup.pending, state => {
        state.isLoading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(signup.rejected, state => {
        state.isLoading = false;
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
      })
      .addCase(updateUserRegisteredEvents.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export default authSlice.reducer;