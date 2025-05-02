import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'; 
import { signupUser } from '../store/authSlice'; 
import Input from '../components/Input';
import Button from '../components/Button';

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    const handleSignUp = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Missing Info", "Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match.");
            return;
        }
         const emailRegex = /\S+@\S+\.\S+/;
         if (!emailRegex.test(email)) {
             Alert.alert("Invalid Email", "Please enter a valid email address.");
             return;
         }
        dispatch(signupUser({ email, password, name }));
    };

    useEffect(() => {
        if (error) {
            Alert.alert("Signup Error", error);
        }
    }, [error, dispatch]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Sign Up</Text>
                <Input
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                     editable={!isLoading}
                />
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
                <Input
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                     editable={!isLoading}
                />
                 <Button title="Sign Up" onPress={handleSignUp} isLoading={isLoading} disabled={isLoading} />

                <TouchableOpacity onPress={() => !isLoading && navigation.navigate('Login')} disabled={isLoading}>
                    <Text style={styles.linkText}>Already have an account? Login</Text>
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

export default SignUpScreen;