import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../contexts/AuthContext";
import AppNavigator from "@/navigation/AppNavigator.jsx";


export default function RootLayout() {
  return (
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
  );
}
