import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux'; 
import { loadUserFromStorage } from '../store/authSlice'; 

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import EventListScreen from '../screens/EventListScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
);

const AppStack = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: '#f8f8f8' },
            headerTintColor: '#333',
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <Stack.Screen name="Events" component={EventListScreen} options={{ title: 'Upcoming Events' }}/>
        <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Details' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'My Dashboard' }} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const { user, isLoading: isAuthLoading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadUserFromStorage());
    }, [dispatch]);

    if (isAuthLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF"/>
            </View>
        );
    }

    return user ? <AppStack /> : <AuthStack />;
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    }
})

export default AppNavigator;