import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false); // Local loading state

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Missing Info", "Please enter both email and password.");
            return;
        }
        setIsLoggingIn(true);
        await login(email, password);
        setIsLoggingIn(false);
        // Navigation is handled by the AppNavigator based on AuthContext state change
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Login</Text>
                <Input
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Input
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                 {isLoading || isLoggingIn ? ( // Show activity indicator based on either global or local state
                    <ActivityIndicator size="large" color="#007AFF" style={styles.loader}/>
                ) : (
                    <Button title="Login" onPress={handleLogin} isLoading={isLoggingIn} />
                )}

                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
     loader: {
        marginVertical: 20,
    },
    linkText: {
        color: '#007AFF',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default LoginScreen;