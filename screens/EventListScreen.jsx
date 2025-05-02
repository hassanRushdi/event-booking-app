import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getEvents } from '@/api/mockAPI';
import EventCard from '@/components/EventCard';
import { useDispatch, useSelector } from 'react-redux'; 
import { logoutUser } from '@/store/authSlice'; 

const EventListScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { isLoading: isAuthLoading } = useSelector((state) => state.auth);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchEvents = async () => {
        if (!isRefreshing) setIsLoading(true);
        try {
            const response = await getEvents();
            setEvents(response.data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
            Alert.alert("Error", "Could not load events.");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

     useFocusEffect(
        useCallback(() => {
             fetchEvents();
        }, [])
     );

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        fetchEvents();
    }, []);

    const handleLogout = useCallback(async () => {
        dispatch(logoutUser());
    }, [dispatch]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.headerButton} disabled={isAuthLoading}>
                         <Text style={styles.headerButtonText}>Dashboard</Text>
                     </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout} style={styles.headerButton} disabled={isAuthLoading}>
                         <Text style={[styles.headerButtonText, isAuthLoading && styles.disabledText]}>{isAuthLoading ? 'Logging out...' : 'Logout'}</Text>
                     </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, handleLogout, isAuthLoading]); 

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
                     <TouchableOpacity onPress={onRefresh} style={{marginTop: 15}}>
                        <Text style={styles.headerButtonText}>Tap to Refresh</Text>
                     </TouchableOpacity>
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
        padding: 20, 
    },
     noEventsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center', 
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
         paddingVertical: 5,
     },
      headerButtonText: {
         color: '#007AFF',
         fontSize: 16,
     },
      disabledText: { 
         color: '#a0a0a0',
      }
});

export default EventListScreen;