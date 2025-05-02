# Event Booking App

A React Native mobile application built with Expo that allows users to browse, view details, and register for upcoming events. It features user authentication and uses Redux Toolkit for state management.

## Features

*   **User Authentication:** Secure Login and Signup functionality.
*   **Event Browsing:** Displays a list of available events with key details (image, title, date, location, price).
*   **Event Details:** Shows comprehensive information about a selected event, including description, speakers (if any), capacity, and available spots.
*   **Event Registration:** Allows logged-in users to register for events (if spots are available).
*   **User Dashboard:** Displays a list of events the logged-in user has registered for.
*   **State Management:** Uses Redux Toolkit for predictable global state management (auth state, user info).
*   **API Interaction:** Communicates with a MockAPI backend using Axios.
*   **Persistence:** Stores user session using AsyncStorage.
*   **Navigation:** Uses React Navigation for screen transitions.
*   **User Experience:** Includes loading indicators, pull-to-refresh on lists, and user feedback via alerts.

## Tech Stack

*   **Framework:** React Native (with Expo)
*   **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
*   **Navigation:** React Navigation (`@react-navigation/native`, `@react-navigation/stack`)
*   **API Client:** Axios
*   **Date Formatting:** `date-fns`
*   **Local Storage:** `@react-native-async-storage/async-storage`
*   **Language:** JavaScript

## Backend

This application uses **MockAPI.io** ([https://mockapi.io/](https://mockapi.io/)) for its backend data simulation.

*   **Base URL:** `https://6811232c3ac96f7119a3b38d.mockapi.io`
*   **Endpoints Used:** `/users`, `/events`

**No separate backend setup is required to run this application.**

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Node.js:** Version 18.x or later recommended. ([Download Node.js](https://nodejs.org/))
*   **npm:** Version 8.x or later (usually comes with Node.js) or **yarn:** Version 1.x or later.
*   **Expo Go App:** Install the Expo Go app on your physical Android or iOS device. ([iOS App Store](https://apps.apple.com/us/app/expo-go/id982107779) / [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
    *   *Alternatively*, you can use an Android Emulator or iOS Simulator.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hassanRushdi/event-booking-app.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd event-booking-app
    ```
3.  **Install dependencies:**
    *   Using npm:
        ```bash
        npm install
        ```
    *   Or using yarn:
        ```bash
        yarn install
        ```

### Running the App

1.  **Start the Expo development server:**
    ```bash
    npx expo start
    ```
    *   This command will start the Metro Bundler and provide you with a QR code and various options in your terminal.

2.  **Run on your device or simulator:**
    *   **On a physical device:** Open the Expo Go app and scan the QR code displayed in the terminal.
    *   **On an Android Emulator:** Press `a` in the terminal while the emulator is running.
    *   **On an iOS Simulator:** Press `i` in the terminal while the simulator is running.

The app should now build and launch on your selected device/simulator. You can start interacting with the event booking application!