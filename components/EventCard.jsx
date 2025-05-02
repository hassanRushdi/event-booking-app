import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns'; 

const EventCard = ({ event, onPress }) => {
    const formattedDate = event.date ? format(new Date(event.date), 'MMM dd, yyyy') : 'Date TBD';
    
    // Safely handle the price value
    const priceNumber = typeof event.price === 'number' ? event.price : 
                       typeof event.price === 'string' ? parseFloat(event.price) : 0;
    const displayPrice = priceNumber > 0 ? `$${priceNumber.toFixed(2)}` : 'Free';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{ uri: event.image || 'https://via.placeholder.com/150' }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.detailText}>{formattedDate}</Text>
                <Text style={styles.detailText}>{event.location}</Text>
                <Text style={[styles.detailText, styles.price]}>{displayPrice}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        overflow: 'hidden', // Ensures image respects border radius
    },
    image: {
        width: 100,
        height: 100, // Adjust height as needed
        // Removed resizeMode contain to fill the space better
    },
    infoContainer: {
        padding: 10,
        flex: 1, // Takes remaining space
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    detailText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 3,
    },
     price: {
        fontWeight: 'bold',
        color: '#007AFF',
        marginTop: 5,
    }
});

export default EventCard;