import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { getEventById, updateEvent } from "@/api/mockAPI.js";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/Button";
import { format } from "date-fns"; // Optional

const EventDetailScreen = () => {
  const route = useRoute();
  const { eventId } = route.params;
  const { user, updateUserRegisteredEvents } = useAuth(); // Get user and update function
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchEventDetails = async () => {
    setIsLoading(true); // Ensure loading is true when fetching
    try {
      const response = await getEventById(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      Alert.alert("Error", "Could not load event details.");
      // Optionally navigate back or show an error message permanently
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch details when the screen mounts or eventId changes
  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  // Refetch if needed when screen comes into focus (e.g., if data could change externally)
  // useFocusEffect(
  //    useCallback(() => {
  //        fetchEventDetails();
  //    }, [eventId])
  // );

  const handleRegister = async () => {
    if (!user || !event) return;

    setIsRegistering(true);
    try {
      // 1. Update the Event's registeredUserIds
      const updatedRegisteredUserIds = [...event.registeredUserIds, user.id];
      await updateEvent(event.id, {
        registeredUserIds: updatedRegisteredUserIds,
      });

      // 2. Update the User's registeredEvents
      const updatedUserRegisteredEvents = [...user.registeredEvents, event.id];
      await updateUserRegisteredEvents(updatedUserRegisteredEvents); // Use context function

      // 3. Update local event state to reflect changes immediately
      setEvent((prevEvent) => ({
        ...prevEvent,
        registeredUserIds: updatedRegisteredUserIds,
      }));

      Alert.alert("Success", "You have successfully registered for the event!");
    } catch (error) {
      console.error("Registration failed:", error);
      Alert.alert(
        "Registration Failed",
        "Could not register for the event. Please try again."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Event not found.</Text>
      </SafeAreaView>
    );
  }

  // Calculate available spots
  const registeredCount = event.registeredUserIds?.length ?? 0;
  const availableSpots = event.capacity - registeredCount;
  const isUserRegistered = user && event.registeredUserIds?.includes(user.id);
  const isFull = availableSpots <= 0;

  const formattedDate = event.date
    ? format(new Date(event.date), "MMMM dd, yyyy")
    : "Date TBD";

  const displayPrice =
    event.price && !isNaN(event.price)
      ? Number(event.price) > 0
        ? `$${Number(event.price).toFixed(2)}`
        : "Free"
      : "Free";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: event.image || "https://via.placeholder.com/400x200" }}
          style={styles.image}
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{event.title}</Text>

          <Text style={styles.detailLabel}>Date & Time:</Text>
          <Text style={styles.detailText}>
            {formattedDate} at {event.time || "Time TBD"}
          </Text>

          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailText}>{event.location}</Text>

          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailText}>{displayPrice}</Text>

          <Text style={styles.detailLabel}>Description:</Text>
          <Text style={styles.detailText}>{event.description}</Text>

          {event.speakers && event.speakers.length > 0 && (
            <>
              <Text style={styles.detailLabel}>Speakers:</Text>
              {event.speakers.map((speaker, index) => (
                <Text key={index} style={styles.detailText}>
                  - {speaker}
                </Text>
              ))}
            </>
          )}

          <Text style={styles.detailLabel}>Capacity:</Text>
          <Text style={styles.detailText}>{event.capacity} attendees</Text>

          <Text style={styles.detailLabel}>Available Spots:</Text>
          <Text
            style={[
              styles.detailText,
              isFull ? styles.spotsFull : styles.spotsAvailable,
            ]}
          >
            {availableSpots > 0 ? `${availableSpots} spots left` : "Event Full"}
          </Text>

          <View style={styles.buttonContainer}>
            {isUserRegistered ? (
              <Text style={styles.registeredText}>
                You are registered for this event.
              </Text>
            ) : (
              <Button
                title={isFull ? "Event Full" : "Register"}
                onPress={handleRegister}
                isLoading={isRegistering}
                disabled={isFull || isRegistering}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 30, // Space at the bottom
  },
  image: {
    width: "100%",
    height: 250, // Adjust height as needed
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
    color: "#555",
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  spotsAvailable: {
    color: "green",
    fontWeight: "bold",
  },
  spotsFull: {
    color: "red",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 30,
  },
  registeredText: {
    fontSize: 16,
    color: "green",
    textAlign: "center",
    fontWeight: "bold",
    paddingVertical: 15,
  },
});

export default EventDetailScreen;
