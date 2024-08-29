import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const EventListScreen = () => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    artist: '',
    location: '',
    description: '',
    organizer: ''
  });
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('Fetching events...');
        const response = await axios.get('http://localhost:5000/api/events');
        console.log('Events fetched:', response.data);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
        Alert.alert('Error', 'Failed to fetch events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    try {
      setLoading(true);
      console.log('Adding event:', newEvent);
      const response = await axios.post('http://localhost:5000/api/events', {
        title: newEvent.title,
        date: newEvent.date,
        artist: newEvent.artist,
        location: newEvent.location,
        description: newEvent.description,
        organizer: newEvent.organizer,
      });

      console.log('Event added:', response.data);
      setEvents(prevEvents => [...prevEvents, response.data.event]);
      if (response.data.notificationSent) {
        Alert.alert('Notification Sent', `A new event by ${newEvent.artist} has been created!`);
      } else {
        Alert.alert('Event Created', `Event "${newEvent.title}" created successfully.`);
      }
      setNewEvent({ title: '', date: '', artist: '', location: '', description: '', organizer: '' });
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding event:", error);
      Alert.alert('Error', 'There was an error adding the event.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    setLoading(true);

    try {
      console.log('Deleting event:', eventId);
      await axios.delete(`http://localhost:5000/api/events/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
      Alert.alert('Success', 'Event deleted successfully.');
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert('Error', 'Failed to delete the event.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Pressable onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}>
        <Text style={styles.eventName}>Title: {item.title}</Text>
        <Text style={styles.eventDate}>Date: {item.date}</Text>
        <Text style={styles.eventLocation}>Location: {item.location}</Text>
      </Pressable>
      <Pressable onPress={() => handleDeleteEvent(item._id)} style={styles.deleteButton}>
        <Text style={styles.buttonText}>Delete</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <Pressable onPress={() => setModalVisible(true)} style={styles.button}>
          <Text style={styles.buttonText}>Add Event</Text>
        </Pressable>
      </View>
      <FlatList
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date"
              value={newEvent.date}
              onChangeText={(text) => setNewEvent({ ...newEvent, date: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Artist"
              value={newEvent.artist}
              onChangeText={(text) => setNewEvent({ ...newEvent, artist: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={newEvent.location}
              onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Organizer"
              value={newEvent.organizer}
              onChangeText={(text) => setNewEvent({ ...newEvent, organizer: text })}
            />
            <Pressable onPress={handleAddEvent} style={styles.button}>
              {loading ? (
                <Text style={styles.buttonText}>Adding...</Text>
              ) : (
                <Text style={styles.buttonText}>Add Event</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setModalVisible(false)} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  eventName: {
    fontSize: 18,
  },
  eventDate: {
    fontSize: 14,
    color: 'gray',
  },
  eventLocation: {
    fontSize: 14,
    color: 'gray',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#390b9c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'red',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
});

export default EventListScreen;
