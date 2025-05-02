import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getEvents } from '@/api/mockAPI';
import EventCard from '@/components/EventCard';
import Button from '@/components/Button'; // Import Button for logout
import { useAuth } from '@/contexts/AuthContext';

const EventListScreen = () => {
    const navigation = useNavigation();
    const { logout } = useAuth(); // Get logout function
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchEvents = async () => {
        try {
            const response = await getEvents();
            setEvents(response.data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
            // Handle error display
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        setIsLoading(true);
        fetchEvents();
    }, []);

    // Refetch events when the screen comes into focus (e.g., after registration)
     useFocusEffect(
        useCallback(() => {
             // Don't set loading true here unless it's the initial load or refresh
             fetchEvents();
        }, [])
     );


    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchEvents();
    }, []);

    const handleLogout = async () => {
        await logout();
        // Navigation is handled by AppNavigator
    }

     // Add Logout and Dashboard buttons to header
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.headerButton}>
                         <Text style={styles.headerButtonText}>Dashboard</Text>
                     </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
                         <Text style={styles.headerButtonText}>Logout</Text>
                     </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, handleLogout]);

    if (isLoading && !isRefreshing) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {events.length === 0 && !isLoading ? (
                <View style={styles.centered}>
                     <Text style={styles.noEventsText}>No events found.</Text>
                </View>
            ) : (
                <FlatList
                    data={events}
                    renderItem={({ item }) => (
                        <EventCard
                            event={item}
                            onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
                        />
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#007AFF"]}/>
                    }
                />
             )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
     noEventsText: {
        fontSize: 16,
        color: '#666',
    },
    list: {
        padding: 15,
    },
     headerButtons: {
         flexDirection: 'row',
         marginRight: 10,
     },
     headerButton: {
         marginLeft: 15,
         paddingVertical: 5, // Add padding for easier tapping
     },
      headerButtonText: {
         color: '#007AFF', // Or your app's primary color
         fontSize: 16,
     },
});

export default EventListScreen;