import React, { useState, useEffect, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EventsListScreen from '../screens/Events/EventsListScreen';
import ArtistsListScreen from '../screens/Artists/ArtistsListScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import NotificationScreen from '@/screens/Notification/NotificationScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
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
      const unreadCount = data.filter(notification => !notification.read).length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <Tab.Navigator
      initialRouteName="Artists"
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#1E90FF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Artists') {
            iconName = 'musical-note';
          } else if (route.name === 'Events') {
            iconName = 'calendar';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }  else if (route.name === 'Notifications') {
            iconName = 'notifications';
          }

          return (
            <View style={{ position: 'relative' }}>
              <Icon name={iconName} size={size} color={color} />
              {route.name === 'Notifications' && unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -10,
                    top: -3,
                    backgroundColor: 'red',
                    borderRadius: 10,
                    width: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10 }}>{unreadCount}</Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#1E90FF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Artists" component={ArtistsListScreen} />
      <Tab.Screen name="Events" component={EventsListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Notifications">
        {(props) => <NotificationScreen {...props} updateUnreadCount={updateUnreadCount} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
