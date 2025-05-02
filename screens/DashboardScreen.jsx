import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getEvents } from '../api/mockAPI';
import { useSelector } from 'react-redux';
import EventCard from '../components/EventCard';

const DashboardScreen = () => {
    const navigation = useNavigation();
    const { user } = useSelector((state) => state.auth);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Manage local loading for event fetching
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchRegisteredEvents = useCallback(async () => {
        if (!isRefreshing && user) setIsLoading(true);

        if (!user || !user.registeredEvents || user.registeredEvents.length === 0) {
            setRegisteredEvents([]);
            setIsLoading(false);
            setIsRefreshing(false);
            return;
        }

        try {
            const response = await getEvents();
            const allEvents = response.data;
            const userEventIds = user.registeredEvents;
            const filteredEvents = allEvents.filter(event => userEventIds.includes(event.id));
            setRegisteredEvents(filteredEvents);
        } catch (error) {
            console.error("Failed to fetch registered events:", error);
            Alert.alert("Error", "Could not load your registered events.");
             setRegisteredEvents([]); // Clear events on error
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user, isRefreshing]); 


    useEffect(() => {
        fetchRegisteredEvents();
    }, [user?.id, user?.registeredEvents?.length, fetchRegisteredEvents]); 

     useFocusEffect(
        useCallback(() => {
            fetchRegisteredEvents();
        }, [fetchRegisteredEvents]) 
     );

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
    }, []);


    if (!user && !isLoading) {
         return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.noEventsText}>Please log in to see your dashboard.</Text>
            </SafeAreaView>
        );
    }

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
                     <TouchableOpacity onPress={onRefresh} style={{marginTop: 15}}>
                        <Text style={styles.headerButtonText}>Tap to Refresh</Text>
                     </TouchableOpacity>
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
     headerButtonText: { 
         color: '#007AFF',
         fontSize: 16,
     },
});

export default DashboardScreen;