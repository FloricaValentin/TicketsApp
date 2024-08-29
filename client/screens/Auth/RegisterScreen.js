import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    let formIsValid = true;
    const newErrors = { username: "", email: "", password: "" };

    if (formData.username.trim() === "") {
      newErrors.username = "Username is required.";
      formIsValid = false;
    }

    if (formData.email.trim() === "") {
      newErrors.email = "Email is required.";
      formIsValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      formIsValid = false;
    }

    if (formData.password.trim() === "") {
      newErrors.password = "Password is required.";
      formIsValid = false;
    }

    setErrors(newErrors);

    if (formIsValid) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/users/",
          formData
        );
        console.log("User created successfully:", response.data);
        Alert.alert("Success", "User created successfully");
        navigation.navigate("Login");
      } catch (error) {
        console.error("Error creating user:", error);
        Alert.alert("Error", "Error creating user");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={formData.username}
          onChangeText={(text) => handleChange("username", text)}
          autoCapitalize="none"
        />
        {errors.username ? (
          <Text style={styles.error}>{errors.username}</Text>
        ) : null}
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
          />
          <Pressable
            onPress={togglePasswordVisibility}
            style={styles.iconContainer}
          >
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </Pressable>
        </View>
        {errors.password ? (
          <Text style={styles.error}>{errors.password}</Text>
        ) : null}
      </View>
      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
      <Text style={styles.signUpText}>
        Already have an account?{" "}
        <Text style={styles.signUpLink} onPress={() => navigation.navigate("")}>
          Login
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: "#ccc",
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
    right: 10,
    top: 12,
  },
  iconText: {
    color: "#1E90FF",
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
    fontSize: 14,
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
