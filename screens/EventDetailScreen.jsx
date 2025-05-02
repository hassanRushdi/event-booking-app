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
import { useRoute } from "@react-navigation/native";
import { getEventById, updateEvent } from "@/api/mockAPI.js";
import { useSelector, useDispatch } from 'react-redux'; 
import { updateUserEvents } from '../store/authSlice'; 
import Button from "../components/Button";
import { format } from "date-fns";

const EventDetailScreen = () => {
  const route = useRoute();
  const { eventId } = route.params;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isRegistering, setIsRegistering] = useState(false); 
  const fetchEventDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getEventById(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error("Failed to fetch event details:", error);
      Alert.alert("Error", "Could not load event details.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, fetchEventDetails]); 



  const handleRegister = async () => {
    if (!user || !event) return;
    if (!user.id) {
        Alert.alert("Error", "User ID is missing. Cannot register.");
        return;
    }

    setIsRegistering(true);
    try {

      const updatedRegisteredUserIds = [...(event.registeredUserIds || []), user.id];
      await updateEvent(event.id, {
        registeredUserIds: updatedRegisteredUserIds,
      });

      const updatedUserRegisteredEvents = [...(user.registeredEvents || []), event.id];
      const resultAction = await dispatch(updateUserEvents({
          userId: user.id,
          newRegisteredEventsList: updatedUserRegisteredEvents
      }));

      if (updateUserEvents.fulfilled.match(resultAction)) {
          setEvent((prevEvent) => ({
            ...prevEvent,
            registeredUserIds: updatedRegisteredUserIds,
          }));
           Alert.alert("Success", "You have successfully registered for the event!");
      } else {
           console.error("Registration failed: User update failed.", resultAction.payload);
           Alert.alert(
             "Registration Partially Failed",
             "Could not update your user profile, but you might be registered with the event. Please check your dashboard later or contact support."
           );
      }

    } catch (error) {
      console.error("Registration failed (Event Update Error):", error);
      Alert.alert(
        "Registration Failed",
        "Could not update the event details. Please try again."
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
            {!user ? (
                 <Text style={styles.loginPrompt}>Please log in to register.</Text>
            ) : isUserRegistered ? (
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
    paddingBottom: 30,
  },
  image: {
    width: "100%",
    height: 250,
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
   loginPrompt: { 
     fontSize: 16,
     color: "#888",
     textAlign: "center",
     fontStyle: 'italic',
     paddingVertical: 15,
   },
});

export default EventDetailScreen;