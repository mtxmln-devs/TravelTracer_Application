import React, { useState } from "react"; // for react and usestate hook
import { NavigationContainer } from "@react-navigation/native"; // for navigation container
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // for bottom tab navigator
import { Ionicons } from "@expo/vector-icons"; // for icons of tabs

// screens for navigation
import Home from "./Screens/Home";
import Journal from "./Screens/Journal";
import Setting from "./Screens/Setting";
import Social from "./Screens/Social";
import Trip_Planner from "./Screens/Trip_Planner";
import Login from "./Screens/LoginForm";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // state for tracking login status, SET TO FALSE MEANS THAT THE USER IS NOT LOGGED IN
  const Tab = createBottomTabNavigator(); // creating bottom tab navigator

  const handleLogin = () => {
    setIsLoggedIn(true); // set login status to true WHEN USER LOGIN
  };

  return (
    <NavigationContainer> 
      {isLoggedIn ? ( // Checker state that if the user is logged in
        <Tab.Navigator
          screenOptions={{ headerShown: false }} // HIDE THE HEADERS ON TABS
        >

            {/* Each Tab.Screen represents a different tab in the navigation */}


          <Tab.Screen
            name="Home" // TAB NAME
            component={Home} // COMPONENT TO RENDER THIS TAB
            options={{
              tabBarIcon: ({ color, size }) => (  // Custom icon for the tab
                <Ionicons name="home-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Trip Planner"
            component={Trip_Planner}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="calendar-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Journal"
            component={Journal}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Social"
            component={Social}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Setting"
            component={Setting}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" color={color} size={size} />
              ),
            }}
          />
          
        </Tab.Navigator>
      ) : (
        <Login onLogin={handleLogin} /> // If not logged in, show the Login screen
      )}
    </NavigationContainer>
  );
}
