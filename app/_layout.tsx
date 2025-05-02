import React from "react";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "@/navigation/AppNavigator";
import { Provider } from 'react-redux';
import { store } from '../store/store'; 

export default function RootLayout() {
  return (
      <Provider store={store}>
        <AppNavigator />
        <StatusBar style="auto" />
      </Provider>
  );
}