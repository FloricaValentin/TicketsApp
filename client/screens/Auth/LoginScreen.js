import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Pressable } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/Ionicons';

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async () => {
    setErrors({ email: "", password: "", general: "" });

    if (formData.email.trim() === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Email is required.",
      }));
      return;
    } else if (!validateEmail(formData.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: "Please enter a valid email address.",
      }));
      return;
    }

    if (formData.password.trim() === "") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: "Password is required.",
      }));
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/users/login", formData);

      const { token, userId } = response.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userId", userId);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      console.log("Login successful. Token:", token, "UserId:", userId);

     navigation.navigate("MainStack")
    } catch (error) {
      console.error("Error logging in:", error.message);
      if (error.response && error.response.data && error.response.data.error) {
        setErrors({ ...errors, general: "Email or password doesn't match." });
      } else {
        setErrors({
          ...errors,
          general: "An error occurred. Please try again later.",
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          autoCapitalize="none"
          inputMode="email-address"
        />
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Password:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
          />
          <Pressable onPress={togglePasswordVisibility} style={styles.iconContainer}>
            <Icon name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
          </Pressable>
        </View>
        {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
      </View>
      {errors.general ? <Text style={styles.error}>{errors.general}</Text> : null}
      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Text style={styles.signUpText}>
        Don't have an account yet?{" "}
        <Text
          style={styles.signUpLink}
          onPress={() => navigation.navigate("Register")}
        >
          Register
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    position: "relative",
  },
  iconContainer: {
    position: "absolute",
    right: 12,
    top: 8,
  },
  button: {
    backgroundColor: "#27c20c",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  signUpText: {
    marginTop: 16,
    textAlign: "center",
  },
  signUpLink: {
    color: "#1E90FF",
  },
});

export default LoginScreen;
