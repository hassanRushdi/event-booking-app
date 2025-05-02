import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Button = ({ title, onPress, style, textStyle, isLoading = false, disabled = false }) => {
    return (
        <TouchableOpacity
            style={[styles.button, style, (disabled || isLoading) && styles.disabledButton]}
            onPress={onPress}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
            ) : (
                <Text style={[styles.text, textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007AFF', // iOS Blue
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 45,
        marginVertical: 10,
    },
    disabledButton: {
        backgroundColor: '#a0a0a0',
    },
    text: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Button;