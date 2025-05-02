import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'; 
import { loginUser } from '../store/authSlice'; 
import Input from '../components/Input';
import Button from '../components/Button';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Missing Info", "Please enter both email and password.");
            return;
        }

        dispatch(loginUser({ email, password }));
    };

     useEffect(() => {
         if (error) {
             Alert.alert("Login Error", error);
             // Optionally dispatch an action to clear the error state
             // dispatch(clearAuthError());
         }
     }, [error, dispatch]);


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
                    editable={!isLoading} 
                />
                <Input
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading} 
                />
                 <Button title="Login" onPress={handleLogin} isLoading={isLoading} disabled={isLoading} />


                <TouchableOpacity onPress={() => !isLoading && navigation.navigate('SignUp')} disabled={isLoading}>
                    <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Styles remain the same
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