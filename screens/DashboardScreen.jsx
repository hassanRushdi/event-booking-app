import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getEvents } from '../api/mockAPI'; // We fetch ALL events and filter
import { useAuth } from '../contexts/AuthContext';
import EventCard from '../components/EventCard';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchRegisteredEvents = async () => {
        if (!user || !user.registeredEvents || user.registeredEvents.length === 0) {
             setRegisteredEvents([]);
             setIsLoading(false);
             setIsRefreshing(false);
            return;
        }

        try {
            // Fetch all events
            const response = await getEvents();
            const allEvents = response.data;

            // Filter events based on user's registeredEvents array
            const userEventIds = user.registeredEvents;
            const filteredEvents = allEvents.filter(event => userEventIds.includes(event.id));
            setRegisteredEvents(filteredEvents);

        } catch (error) {
            console.error("Failed to fetch registered events:", error);
             Alert.alert("Error", "Could not load your registered events.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Fetch when the screen mounts or user data changes
    useEffect(() => {
        setIsLoading(true);
        fetchRegisteredEvents();
    }, [user]); // Dependency on user ensures refetch if user logs in/out or data changes

    // Refetch when the screen comes into focus
     useFocusEffect(
        useCallback(() => {
             // Avoid setting isLoading true here on every focus, let RefreshControl handle it
            fetchRegisteredEvents();
        }, [user]) // Re-run if user context changes while screen is focused
     );

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchRegisteredEvents();
    }, [user]);

    if (isLoading && !isRefreshing) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>My Registered Events</Text>
            {registeredEvents.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.noEventsText}>You haven't registered for any events yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={registeredEvents}
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
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#333',
    },
    noEventsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    list: {
        paddingHorizontal: 15,
        paddingBottom: 15,
    },
});

export default DashboardScreen;