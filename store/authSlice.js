import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByEmail, createUser, getUserById, updateUser } from '@/api/mockAPI';
import { Alert } from 'react-native';

export const loadUserFromStorage = createAsyncThunk(
    'auth/loadUserFromStorage',
    async (_, { rejectWithValue }) => {
        try {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (storedUserId) {
                const response = await getUserById(storedUserId);
                if (response.data) {
                    return response.data; // Fulfilled with user data
                } else {
                    await AsyncStorage.removeItem('userId');
                    return null; // Fulfilled with null if user fetch failed
                }
            }
            return null; // Fulfilled with null if no userId in storage
        } catch (e) {
            console.error("Failed to load user from storage", e);
            return rejectWithValue("Failed to load session."); // Rejected
        }
    }
);

// Thunk for login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await getUserByEmail(email);
            const foundUser = response.data.find(u => u.email === email);

            if (foundUser && foundUser.password === password) {
                await AsyncStorage.setItem('userId', foundUser.id);
                return foundUser; // Fulfilled with user data
            } else {
                 Alert.alert("Login Failed", "Invalid email or password.");
                return rejectWithValue("Invalid credentials"); // Rejected
            }
        } catch (error) {
            console.error("Login error:", error);
            Alert.alert("Login Error", "An error occurred during login.");
            return rejectWithValue(error.message || "Login failed"); // Rejected
        }
    }
);

// Thunk for signup
export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async ({ email, password, name }, { rejectWithValue }) => {
        try {
            const existingUsers = await getUserByEmail(email);
            if (existingUsers.data.length > 0) {
                Alert.alert("Signup Failed", "Email already in use.");
                return rejectWithValue("Email already in use"); // Rejected
            }

            const newUser = { email, password, name, registeredEvents: [] };
            const response = await createUser(newUser);
            if (response.data) {
                await AsyncStorage.setItem('userId', response.data.id);
                return response.data; // Fulfilled with new user data
            } else {
                 // Should ideally not happen if createUser resolves, but handle defensively
                 Alert.alert("Signup Error", "Failed to create user account.");
                 return rejectWithValue("Failed to create user");
            }
        } catch (error) {
            console.error("Signup error:", error);
            Alert.alert("Signup Error", "An error occurred during signup.");
            return rejectWithValue(error.message || "Signup failed"); // Rejected
        }
    }
);

// Thunk for logout
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await AsyncStorage.removeItem('userId');
            return null; // Fulfilled (no specific payload needed, reducer handles state)
        } catch (e) {
            console.error("Logout failed", e);
             return rejectWithValue("Logout failed"); // Rejected
        }
    }
);

// Thunk to update user's registered events (e.g., after event registration)
export const updateUserEvents = createAsyncThunk(
    'auth/updateUserEvents',
    async ({ userId, newRegisteredEventsList }, { rejectWithValue }) => {
        if (!userId) return rejectWithValue("User not logged in");
         try {
            // We only need to update the user data in the backend.
            // The user object in Redux state will be updated via the 'fulfilled' action.
            // We assume the caller already has the *complete* new list.
             const response = await updateUser(userId, { registeredEvents: newRegisteredEventsList });
             if (response.data) {
                 return response.data; // Return the *full* updated user object
             } else {
                 throw new Error("Update failed, no data returned");
             }
         } catch (error) {
            console.error("Failed to update user registered events:", error);
             // Optional: Alert user here or handle in component based on rejected state
            return rejectWithValue(error.message || "Failed to update events"); // Rejected
         }
    }
);


// --- Slice Definition ---

const initialState = {
    user: null, // Store user object { id, email, name, registeredEvents }
    isLoading: true, // Start true to handle initial load check
    error: null, // Store potential error messages
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Optional: Reducer to manually clear error if needed
        clearAuthError: (state) => {
            state.error = null;
        },
        // Potentially add setUser directly if needed outside of thunks, but usually handled by thunks
        // setUserState: (state, action) => {
        //   state.user = action.payload;
        // }
    },
    extraReducers: (builder) => {
        builder
            // loadUserFromStorage
            .addCase(loadUserFromStorage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loadUserFromStorage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload; // payload is user data or null
                state.error = null;
            })
            .addCase(loadUserFromStorage.rejected, (state, action) => {
                state.isLoading = false;
                state.user = null; // Ensure user is null on failure
                state.error = action.payload; // Error message from rejectWithValue
            })
            // loginUser
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload; // payload is user data
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload; // Error message from rejectWithValue
            })
            // signupUser
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload; // payload is new user data
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload; // Error message from rejectWithValue
            })
            // logoutUser
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true; // Optional: show loading during logout
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null; // Clear user data
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                // Keep user logged in? Or force log out? Depends on desired behaviour.
                // state.user = null; // Force logout state even if async storage fails
                state.error = action.payload;
                 Alert.alert("Logout Error", "Could not properly log out. Please restart the app if issues persist.");
            })
             // updateUserEvents
             .addCase(updateUserEvents.pending, (state) => {
                 // Optionally set a specific loading state for this action
                 // state.isUpdatingEvents = true;
                 state.error = null;
             })
             .addCase(updateUserEvents.fulfilled, (state, action) => {
                 state.user = action.payload; // Update user state with the latest data from API
                 // state.isUpdatingEvents = false;
                 state.error = null;
             })
             .addCase(updateUserEvents.rejected, (state, action) => {
                // state.isUpdatingEvents = false;
                state.error = action.payload;
                 Alert.alert("Update Failed", `Could not update your registered events: ${action.payload}`);
             });
    },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;