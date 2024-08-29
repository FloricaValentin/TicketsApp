import React, { useState, useEffect } from 'react';
import {  Text, TextInput, StyleSheet, Image, Pressable, ActivityIndicator, Alert,ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    town: '',
    socialLinks: { facebook: '', twitter: '', instagram: '' },
    password: '',
    profilePictureUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');

        if (!storedUserId) {
          console.error('User ID is null');
          Alert.alert('Error', 'Failed to load user data.');
          return;
        }

        setUserId(storedUserId);

        const response = await axios.get(`http://localhost:5000/api/users/${storedUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { username, bio, town, socialLinks, profilePicture } = response.data;
        setFormData({
          username,
          bio: bio || '',
          town: town || '',
          socialLinks: socialLinks || { facebook: '', twitter: '', instagram: '' },
          password: '',
          profilePictureUrl: profilePicture || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data.');
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthStack' }],
    });    } catch (error) {
      Alert.alert('Logout Failed', 'Unable to logout');
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData({
      ...formData,
      socialLinks: { ...formData.socialLinks, [platform]: value },
    });
  };

  const validateInputs = () => {
    let formIsValid = true;
    const newErrors = {};

    if (formData.username.trim() === '') {
      newErrors.username = 'Username is required.';
      formIsValid = false;
    }
    if (formData.password.trim() === '') {
      newErrors.password = 'Password is required.';
      formIsValid = false;
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const storedUserId = await AsyncStorage.getItem('userId');

      if (!storedUserId) {
        console.error('User ID is null during submission');
        Alert.alert('Error', 'User ID is invalid.');
        setLoading(false);
        return;
      }

      await axios.put(
        `http://localhost:5000/api/users/${storedUserId}`,
        { ...formData, profilePicture: formData.profilePictureUrl || image?.uri },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setFormData({ ...formData, profilePictureUrl: '' });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Update Profile</Text>

      <Pressable onPress={handleImagePick}>
        <Image
          source={
            image
              ? { uri: image.uri }
              : formData.profilePictureUrl
              ? { uri: formData.profilePictureUrl }
              : require('../../assets/images/profile-picture.jpg')
          }
          style={styles.profileImage}
        />
        <Text style={styles.usernameText}>{formData.username}</Text>
        <Text style={styles.changePhotoText}>Change Profile Picture</Text>
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={formData.username}
        onChangeText={(text) => handleChange('username', text)}
      />
      {errors.username && <Text style={styles.error}>{errors.username}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={formData.bio}
        onChangeText={(text) => handleChange('bio', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Town"
        value={formData.town}
        onChangeText={(text) => handleChange('town', text)}
      />

      <Text style={styles.socialTitle}>Social Media Links</Text>
      <TextInput
        style={styles.input}
        placeholder="Facebook"
        value={formData.socialLinks.facebook}
        onChangeText={(text) => handleSocialLinkChange('facebook', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Twitter"
        value={formData.socialLinks.twitter}
        onChangeText={(text) => handleSocialLinkChange('twitter', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Instagram"
        value={formData.socialLinks.instagram}
        onChangeText={(text) => handleSocialLinkChange('instagram', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => handleChange('password', text)}
        secureTextEntry
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  changePhotoText: {
    textAlign: 'center',
    color: '#007BFF',
    marginVertical: 12,
    marginBottom: 25,
  },
  usernameText: {
    textAlign: 'center',
    color: '#black',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  socialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
