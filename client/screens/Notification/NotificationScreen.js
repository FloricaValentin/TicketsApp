import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Alert, StyleSheet,Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import io from 'socket.io-client';

const NotificationScreen = ({ updateUnreadCount }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const initSocket = () => {
      const newSocket = io('http://localhost:5000/');
      newSocket.on('newNotification', (notification) => {
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);
        fetchNotifications();
      });
    };

    initSocket();
    fetchNotifications();
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      const response = await fetch(`http://localhost:5000/api/notifications/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setNotifications(data);

      const unreadCount = data.filter(notification => !notification.read).length;

      updateUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [updateUnreadCount]);


  const handleDeleteNotifications = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'There was an error deleting the notification.');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('token');

      await fetch('http://localhost:5000/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );

      const unreadCount = notifications.filter(notification => !notification.read).length - 1;
      updateUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'There was an error marking the notification as read.');
    }
  };

  const renderNotification = ({ item }) => (
    <View style={[styles.notificationContainer, item.read && styles.readNotification]}>
      <Pressable onPress={() => markAsRead(item._id)} style={{ flex: 1 }}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </Pressable>
      <Pressable onPress={() => handleDeleteNotifications(item._id)} style={styles.deleteButton}>
        <Text style={styles.buttonText}>Delete</Text>
      </Pressable>
    </View>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        ListEmptyComponent={<Text style={styles.emptyText}>No notifications available</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  notificationContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  readNotification: {
    backgroundColor: '#f0f0f0',
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
});

export default NotificationScreen;
