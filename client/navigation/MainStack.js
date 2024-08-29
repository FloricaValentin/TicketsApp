import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import EventDetailsScreen from '../screens/Events/EventDetailsScreen';
import ArtistDetailsScreen from '../screens/Artists/ArtistDetailsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import NotificationScreen from '@/screens/Notification/NotificationScreen';

const Stack = createStackNavigator();

export default function MainStack() {
    return (
        <Stack.Navigator screenOptions={{
            headerStyle: {
              backgroundColor: '#09096e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            }}}>
            <Stack.Screen
                name="TabNavigator"
                component={TabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="ArtistDetails" component={ArtistDetailsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
        </Stack.Navigator>
    );
}

