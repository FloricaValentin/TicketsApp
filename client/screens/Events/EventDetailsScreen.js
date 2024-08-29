import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const EventDetailsScreen = () => {
  const route = useRoute();
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (!event) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.detail}>Date: {event.date}</Text>
            <Text style={styles.detail}>Artist: {event.artist}</Text>
            <Text style={styles.detail}>Location: {event.location}</Text>
            <Text style={styles.detail}>Description: {event.description}</Text>
            <Text style={styles.detail}>Organizer: {event.organizer}</Text>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  detail: {
    fontSize: 18,
    marginVertical: 8,
    textAlign: 'center',
    color: '#ddd',
  },
});

export default EventDetailsScreen;
