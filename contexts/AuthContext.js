import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByEmail, createUser, getUserById, updateUser } from '../api/mockAPI.js';
import { Alert } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Store user object { id, email, name, registeredEvents }
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check async storage for logged in user on app start
        const loadUser = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    // Fetch full user details if needed, or just set ID
                    const response = await getUserById(storedUserId);
                     if (response.data) {
                         setUser(response.data);
                     } else {
                         // Handle case where user ID exists but fetch fails (e.g., user deleted)
                         await AsyncStorage.removeItem('userId');
                     }
                }
            } catch (e) {
                console.error("Failed to load user from storage", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
         setIsLoading(true);
        try {
            // mockAPI doesn't have password checking, so we fetch by email and check manually
            const response = await getUserByEmail(email);
             // response.data will be an array, find the user
            const foundUser = response.data.find(u => u.email === email);

            if (foundUser && foundUser.password === password) {
                setUser(foundUser);
                await AsyncStorage.setItem('userId', foundUser.id);
                 setIsLoading(false);
                return true;
            } else {
                Alert.alert("Login Failed", "Invalid email or password.");
                 setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error("Login error:", error);
            Alert.alert("Login Error", "An error occurred during login.");
             setIsLoading(false);
            return false;
        }
    };

    const signup = async (email, password, name) => {
         setIsLoading(true);
        try {
            // Check if user already exists (optional but good practice)
            const existingUsers = await getUserByEmail(email);
            if (existingUsers.data.length > 0) {
                Alert.alert("Signup Failed", "Email already in use.");
                 setIsLoading(false);
                return false;
            }

            const newUser = { email, password, name, registeredEvents: [] };
            const response = await createUser(newUser);
            if (response.data) {
                setUser(response.data);
                await AsyncStorage.setItem('userId', response.data.id);
                 setIsLoading(false);
                return true;
            } else {
                 setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error("Signup error:", error);
            Alert.alert("Signup Error", "An error occurred during signup.");
             setIsLoading(false);
            return false;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            setUser(null);
            await AsyncStorage.removeItem('userId');
        } catch(e) {
            console.error("Logout failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to update user's registered events (used after registration)
    const updateUserRegisteredEvents = async (newRegisteredEventsList) => {
         if (!user) return;
         try {
            const updatedUserData = { ...user, registeredEvents: newRegisteredEventsList };
            const response = await updateUser(user.id, updatedUserData);
             if (response.data) {
                 setUser(response.data); // Update context state
             }
         } catch (error) {
            console.error("Failed to update user registered events:", error);
            // Optionally inform the user
         }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUserRegisteredEvents }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};