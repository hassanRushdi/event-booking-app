import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const Input = ({ style, ...props }) => {
    return (
        <TextInput
            style={[styles.input, style]}
            placeholderTextColor="#aaa"
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
});

export default Input;