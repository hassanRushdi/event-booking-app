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
                    return response.data; 
                } else {
                    await AsyncStorage.removeItem('userId');
                    return null; 
                }
            }
            return null;
        } catch (e) {
            console.error("Failed to load user from storage", e);
            return rejectWithValue("Failed to load session."); 
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await getUserByEmail(email);
            const foundUser = response.data.find(u => u.email === email);

            if (foundUser && foundUser.password === password) {
                await AsyncStorage.setItem('userId', foundUser.id);
                return foundUser; 
            } else {
                 Alert.alert("Login Failed", "Invalid email or password.");
                return rejectWithValue("Invalid credentials"); 
            }
        } catch (error) {
            console.error("Login error:", error);
            Alert.alert("Login Error", "An error occurred during login.");
            return rejectWithValue(error.message || "Login failed"); 
        }
    }
);

export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async ({ email, password, name }, { rejectWithValue }) => {
        try {
            const existingUsers = await getUserByEmail(email);
            if (existingUsers.data.length > 0) {
                Alert.alert("Signup Failed", "Email already in use.");
                return rejectWithValue("Email already in use"); 
            }

            const newUser = { email, password, name, registeredEvents: [] };
            const response = await createUser(newUser);
            if (response.data) {
                await AsyncStorage.setItem('userId', response.data.id);
                return response.data; 
            } else {
                 Alert.alert("Signup Error", "Failed to create user account.");
                 return rejectWithValue("Failed to create user");
            }
        } catch (error) {
            console.error("Signup error:", error);
            Alert.alert("Signup Error", "An error occurred during signup.");
            return rejectWithValue(error.message || "Signup failed"); 
        }
    }
);

// Thunk for logout
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await AsyncStorage.removeItem('userId');
            return null; 
        } catch (e) {
            console.error("Logout failed", e);
             return rejectWithValue("Logout failed"); 
        }
    }
);

export const updateUserEvents = createAsyncThunk(
    'auth/updateUserEvents',
    async ({ userId, newRegisteredEventsList }, { rejectWithValue }) => {
        if (!userId) return rejectWithValue("User not logged in");
         try {
           
             const response = await updateUser(userId, { registeredEvents: newRegisteredEventsList });
             if (response.data) {
                 return response.data; 
             } else {
                 throw new Error("Update failed, no data returned");
             }
         } catch (error) {
            console.error("Failed to update user registered events:", error);
            return rejectWithValue(error.message || "Failed to update events"); // Rejected
         }
    }
);


const initialState = {
    user: null, 
    isLoading: true, 
    error: null, 
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthError: (state) => {
            state.error = null;
        },
       
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
                state.error = action.payload; 
            })
            // logoutUser
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true; 
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null; 
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                 Alert.alert("Logout Error", "Could not properly log out. Please restart the app if issues persist.");
            })
             .addCase(updateUserEvents.pending, (state) => {
                 state.error = null;
             })
             .addCase(updateUserEvents.fulfilled, (state, action) => {
                 state.user = action.payload; 
                 state.error = null;
             })
             .addCase(updateUserEvents.rejected, (state, action) => {
                state.error = action.payload;
                 Alert.alert("Update Failed", `Could not update your registered events: ${action.payload}`);
             });
    },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;