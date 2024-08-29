import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { followArtist, unfollowArtist, setFollowedArtists } from '../../redux/followSlice';

const ArtistsListScreen = () => {
  const [artists, setArtists] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newArtist, setNewArtist] = useState({ name: '', description: '', genres: '' });
  const [loading, setLoading] = useState(false);
  const [followedModalVisible, setFollowedModalVisible] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const followedArtists = useSelector(state => state.follow.followedArtists);

  const fetchArtists = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/artists');
      setArtists(response.data);
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchArtists();
    }, [])
  );

  const getFollowedArtists = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:5000/api/users/followedArtists', {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(setFollowedArtists(response.data));
      }
    } catch (error) {
      console.error("Error fetching followed artists:", error);
    }
  };

  const handleAddArtist = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/artists', {
        name: newArtist.name,
        description: newArtist.description,
        genres: newArtist.genres.split(',').map(genre => genre.trim()),
      });

      setArtists(prevArtists => [...prevArtists, response.data]);
      setNewArtist({ name: '', description: '', genres: '' });
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding artist:", error);
      Alert.alert('Error', 'There was an error adding the artist.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArtist = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/artists/${id}`);
      setArtists(prevArtists => prevArtists.filter(artist => artist._id !== id));
    } catch (error) {
      console.error("Error deleting artist:", error);
      Alert.alert('Error', 'There was an error deleting the artist.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Pressable onPress={() => navigation.navigate('ArtistDetails', { artistId: item._id })}>
        <Text style={styles.artistName}> Artist: {item.name}</Text>
        <Text style={styles.artistGenres}>Genres: {item.genres.join(', ')}</Text>
      </Pressable>
      <View style={styles.buttonContainer}>
        <Pressable onPress={() => handleDeleteArtist(item._id)} style={[styles.button, styles.deleteButton]}>
          <Text style={styles.buttonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Artists</Text>
        <View style={styles.headerButtons}>
          <Pressable onPress={() => setModalVisible(true)} style={styles.button}>
            <Text style={styles.buttonText}>Add Artist</Text>
          </Pressable>
        </View>
      </View>
      <FlatList
        data={artists}
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
            <Text style={styles.modalTitle}>Add New Artist</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newArtist.name}
              onChangeText={(text) => setNewArtist({ ...newArtist, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={newArtist.description}
              onChangeText={(text) => setNewArtist({ ...newArtist, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Genres (comma separated)"
              value={newArtist.genres}
              onChangeText={(text) => setNewArtist({ ...newArtist, genres: text })}
            />
            <Pressable onPress={handleAddArtist} style={styles.button}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Add Artist</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setModalVisible(false)} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={followedModalVisible}
        onRequestClose={() => setFollowedModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={artists.filter(artist => followedArtists.includes(artist._id))}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.artistName}>{item.name}</Text>
                  <Text style={styles.artistGenres}>{item.genres.join(', ')}</Text>
                </View>
              )}
            />
            <Pressable onPress={() => setFollowedModalVisible(false)} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Close</Text>
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
  headerButtons: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  artistName: {
    fontSize: 18,
    paddingVertical: 8,
    fontWeight: 'bold',
  },
  artistGenres: {
    fontSize: 14,
    color: 'gray',
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
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#390b9c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'gray',
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
});

export default ArtistsListScreen;
