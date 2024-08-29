import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import {
  followArtist,
  unfollowArtist,
  setFollowedArtists,
} from "../../redux/followSlice";

const ArtistDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { artistId } = route.params;
  const dispatch = useDispatch();
  const followedArtists = useSelector((state) => state.follow.followedArtists);

  const [artist, setArtist] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newGenres, setNewGenres] = useState("");
  const [formData, setFormData] = useState({ pictureUrl: "" });
  const isFollowing = followedArtists.includes(artistId);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/artists/${artistId}`
        );
        const { picture } = response.data;
        setFormData({ pictureUrl: picture || "" });
        setArtist(response.data);
        setNewTitle(response.data.name);
        setNewDescription(response.data.description);
        setNewGenres(response.data.genres);
      } catch (error) {
        console.error("Error fetching artist details:", error);
      }
    };

    const loadFollowedArtists = async () => {
      try {
        const storedFollowedArtists = await AsyncStorage.getItem(
          "followedArtists"
        );
        if (storedFollowedArtists) {
          dispatch(setFollowedArtists(JSON.parse(storedFollowedArtists)));
        }
      } catch (error) {
        console.error(
          "Error loading followed artists from AsyncStorage:",
          error
        );
      }
    };

    fetchArtist();
    loadFollowedArtists();
  }, [artistId, dispatch]);

  const handleUpdateDetails = async () => {
    if (!newTitle || !newDescription || !newGenres) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const data = {
        name: newTitle,
        description: newDescription,
        genres: newGenres,
      };

      await axios.put(`http://localhost:5000/api/artists/${artistId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Alert.alert("Success", "Artist details updated successfully!");
      navigation.navigate("Artists", { updatedArtist: data });
    } catch (error) {
      console.error("Error updating artist details:", error);
      Alert.alert("Error", "Failed to update artist details.");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const selectedImage = result.assets[0];

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", {
        uri: selectedImage.uri,
        type: "image/jpeg",
        name: selectedImage.uri.split("/").pop(),
      });

      await axios.put(
        `http://localhost:5000/api/artists/${artistId}`,
        { ...formData, picture: formData.pictureUrl || selectedImage.uri },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Artist picture updated successfully!");
      navigation.navigate("Artists");
    } catch (error) {
      console.error("Error updating artist picture:", error);
      Alert.alert("Error", "Failed to update artist picture.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowArtist = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Authentication token not found.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/artists/follow`,
        { artistId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        dispatch(followArtist(artistId));

        const updatedFollowedArtists = [...followedArtists, artistId];
        await AsyncStorage.setItem(
          "followedArtists",
          JSON.stringify(updatedFollowedArtists)
        );

        Alert.alert("Success", "You are now following this artist.");
      }
    } catch (error) {
      console.error(
        "Error following artist:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to follow the artist.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollowArtist = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Authentication token not found.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/artists/unfollow`,
        { artistId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        dispatch(unfollowArtist(artistId));

        const updatedFollowedArtists = followedArtists.filter(
          (id) => id !== artistId
        );
        await AsyncStorage.setItem(
          "followedArtists",
          JSON.stringify(updatedFollowedArtists)
        );

        Alert.alert("Success", "You have unfollowed this artist.");
      }
    } catch (error) {
      console.error(
        "Error unfollowing artist:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to unfollow the artist.");
    } finally {
      setLoading(false);
    }
  };

  if (!artist) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={
          image
            ? { uri: image.uri }
            : formData.pictureUrl
            ? { uri: formData.pictureUrl }
            : require("../../assets/images/profile-picture.jpg")
        }
        style={styles.imageBackground}
        blurRadius={10}
      >
        <View style={styles.overlay}>
          <Text style={styles.name}>Artist Name: {artist.name}</Text>

          <Pressable
            style={styles.iconButton}
            onPress={isFollowing ? handleUnfollowArtist : handleFollowArtist}
            disabled={loading}
          >
            <Icon
              name={isFollowing ? "heart" : "heart-o"}
              size={30}
              color={isFollowing ? "red" : "white"}
            />
            <Text style={styles.iconButtonText}>
              {loading
                ? isFollowing
                  ? "Unfollowing..."
                  : "Following..."
                : isFollowing
                ? "Following"
                : "Follow"}
            </Text>
          </Pressable>

          <Text style={styles.description}>
            Artist Description: {artist.description}
          </Text>
          <Text style={styles.genres}>Genres: {artist.genres}</Text>
        </View>

        <Pressable onPress={handleImagePick} style={styles.pencilIconContainer}>
          <Icon name="pencil" size={20} color="#fff" />
        </Pressable>
      </ImageBackground>

      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.updateButton}
      >
        <Text style={styles.updateButtonText}>Change Details</Text>
      </Pressable>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Artist Name"
              style={styles.input}
            />
            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Description"
              style={styles.input}
              multiline
            />
            <TextInput
              value={newGenres}
              onChangeText={setNewGenres}
              placeholder="Genres (comma separated)"
              style={styles.input}
            />
            <Pressable
              onPress={handleUpdateDetails}
              style={styles.updateButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updateButtonText}>Update</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={[styles.button, styles.cancelButton]}
            >
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
    backgroundColor: "gray",
  },
  imageBackground: {
    height: "85%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    width: "100%",
    height: "85%",
    marginTop: -80,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginVertical: 10,
  },
  genres: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  iconButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#fff",
  },
  pencilIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    borderRadius: 20,
  },
  updateButton: {
    backgroundColor: "#27c20c",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    width: "30%",
    alignSelf: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 10,
    alignItems: "center",
    marginVertical: 5,
    borderRadius: 5,
    width: "20%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ArtistDetailsScreen;
