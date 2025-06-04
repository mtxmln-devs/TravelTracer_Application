import { StatusBar } from "expo-status-bar"; 
import React, { useState, useEffect } from "react"; 
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, ImageBackground, Alert, Modal } from "react-native"; 
import AsyncStorage from "@react-native-async-storage/async-storage"; 

export default function Login({ onLogin }) {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [signupUsername, setSignupUsername] = useState(""); 
  const [signupPassword, setSignupPassword] = useState(""); 

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username'); 
        if (storedUsername) {
          setUsername(storedUsername); 
        }
      } catch (error) {
        console.error("Error loading username from AsyncStorage:", error); 
      }
    };

    loadUsername(); 
  }, []); 

  // HANDLE LOGIN LOGIC
  const handleLogin = async () => {
    if (username === "" || password === "") {
      Alert.alert("Put credentials first"); 
    } else {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedPassword = await AsyncStorage.getItem('password');

        if (storedUsername && storedPassword) {
          if (username === storedUsername && password === storedPassword) {
            Alert.alert("Login Successful!"); 
            onLogin(); 
          } else {
            Alert.alert("Invalid username or password"); 
          }
        } else {
          Alert.alert("No account found. Please sign up first."); 
        }
      } catch (error) {
        console.error("Error during login:", error); 
      }
    }
  };

  const handleSignup = async () => {
    if (signupUsername === "" || signupPassword === "") {
      Alert.alert("Please fill out all fields"); 
    } else {
      try {
        await AsyncStorage.setItem('username', signupUsername); 
        await AsyncStorage.setItem('password', signupPassword); 
        Alert.alert("Sign-up Successful!"); 
        setIsModalVisible(false);  
      } catch (error) {
        console.error("Error saving new user to AsyncStorage:", error); 
      }
    }
  };

  return (
    <ImageBackground 
      source={require("../assets/bgGradient.png")} 
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView style={styles.container}>
        <StatusBar style="auto" /> 
        <View style={styles.form}>
          <Text style={styles.titleText}>TripTrack!</Text> 

          <Image
            source={require("../assets/airplane-icon.png")} 
            style={styles.homeIcon}
          />

       
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            placeholderTextColor="#A9A9A9"
            onChangeText={setUsername} 
          />

   
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword} 
            placeholderTextColor="#A9A9A9"
            secureTextEntry={true}  
          />

          
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin} 
          >
            <Text style={styles.buttonText}>LOGIN</Text>
          </TouchableOpacity>

            
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsModalVisible(true)} 
          >

            <Text style={styles.buttonText}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      
      <Modal 
        transparent={true} 
        visible={isModalVisible}  
        animationType="slide" 
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Up</Text> 
           
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={signupUsername}
              placeholderTextColor="#A9A9A9"
              onChangeText={setSignupUsername} 
            />

    
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={signupPassword} 
              onChangeText={setSignupPassword}  
              placeholderTextColor="#A9A9A9"
              secureTextEntry={true} 
            />

            
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup} 
            >
              <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

          
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsModalVisible(false)} 
            >
              <Text style={styles.buttonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    backgroundColor: "transparent",
    height: '80%',
    width: '85%',
    borderRadius: 35,
    alignItems: "center",
    padding: 30,
  },
  titleText: {
    color: "black",
    fontSize: 60,
    marginTop: 40,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  homeIcon: {
    height: 150,
    width: 160,
    marginTop: 30,
    marginBottom: 20,
  },
  input: {
    height: 55,
    width: 310,
    borderColor: "#674636",
    borderWidth: 1,
    borderRadius: 25,
    elevation: 10,
    marginTop: 20,
    paddingHorizontal: 20,
    color: "black",
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#ECDFCC",
    marginTop: 30,
    padding: 10,
    borderRadius: 20,
    width: 150,
    alignItems: "center",
    elevation: 5,
  },
  buttonText: {
    color: "black",
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  }
});
