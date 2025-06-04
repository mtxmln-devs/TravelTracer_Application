import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import CreateTrips from './CreateTrips';
import AddDestinations from './AddDestinations';
import SetReminders from './SetReminders';
import AddLocations from './AddLocations';

const Stack = createStackNavigator();

function TripPlannerScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>TRIP {"\n"} PLANNER</Text>
      
      <Image
        source={require("../assets/airplane-icon.png")}
        style={styles.homeIcon}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.ovalButton} 
          onPress={() => navigation.navigate('CreateTrips')}
        >
          <Text style={styles.buttonText}>Create Trips</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.ovalButton} 
          onPress={() => navigation.navigate('AddDestinations')}
        >
          <Text style={styles.buttonText}>Add Destinations</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.ovalButton} 
          onPress={() => navigation.navigate('SetReminders')}
        >
          <Text style={styles.buttonText}>Set Reminders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.ovalButton} 
          onPress={() => navigation.navigate('AddLocations')}
        >
          <Text style={styles.buttonText}>Add Locations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Trip_Planner() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripPlanner" component={TripPlannerScreen} />
      <Stack.Screen name="CreateTrips" component={CreateTrips} />
      <Stack.Screen name="AddDestinations" component={AddDestinations} />
      <Stack.Screen name="SetReminders" component={SetReminders} />
      <Stack.Screen name="AddLocations" component={AddLocations} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC785",
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 30,
    marginLeft: -200,
    textAlign: 'center',
  },
  homeIcon: {
    width: 170,
    height: 170,
    marginTop: -140,
    marginLeft: 200,
  },  
  buttonContainer: {
    flexDirection: "column", // Changed to column to ensure buttons stack vertically
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 50,
    flexWrap: "nowrap", // Ensuring buttons do not wrap
    alignItems: 'center',
  },
  ovalButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 15,
    borderRadius: 40, 
    marginVertical: 10, // Added vertical margin to space buttons
    shadowColor: "#000",
    elevation: 2,
    width: '90%', // Changed to 90% of the screen width for a wider button
  },
  buttonText: {
    fontSize: 25,
    color: "black",
    textAlign: "center",
    padding: 23
  },
});
