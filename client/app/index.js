import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import store from "../redux/store";
import { createStackNavigator } from "@react-navigation/stack";
import AuthStack from "../navigation/AuthStack";
import MainStack from "../navigation/MainStack";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RootStack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    checkLoginStatus();
  }, []);

  return (
    <Provider store={store}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="AuthStack" component={AuthStack} />
          <RootStack.Screen name="MainStack" component={MainStack} />
      </RootStack.Navigator>
    </Provider>
  );
}
