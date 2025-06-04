import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Text } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
        <Text style={styles.titleText}>OVERVIEW</Text>
        
        <Image
          source={require("../assets/airplane-icon.png")}
          style={styles.homeIcon}
        />

        <Image
          source={require("../assets/mapPic.jpg")}
          style={styles.mapImage}
        />

  <Text style={styles.statsText}>STATISTICS</Text>
    <View style={styles.statsContainer}>
        <View style={styles.roundedStats}>
          <Text style={styles.statValue}>323 miles</Text>
          <Text style={styles.statLabel}>Total Distance</Text>
        </View>

       <View style={styles.roundedStats}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Places Visited</Text>
        </View>
        
        <View style={styles.roundedStats}>
          <Text style={styles.statValue}>37.4°C</Text>
          <Text style={styles.statLabel}>Weather</Text>
        </View>
   </View>

</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#82A0D8",
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 55,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 20,
    marginLeft: -120,
  },
  homeIcon: {
    width: 130,
    height: 130,
    marginTop: -100,
    marginLeft: 270,
  },  
  mapImage: {
    marginTop: 20,
    height: 350,
    width: 380,
    borderRadius: 25,
  },
  statsText: {
    fontSize: 55,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  roundedStats: {
    backgroundColor: '#ffffff',
    width: 120,
    height: 120,
    borderRadius: 70, 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3  ,
    borderColor: 'black',
    shadowColor: 'gray',
    shadowRadius: 4,
    elevation: 5,
  },
  statValue: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: "center",
  },
  statLabel: {
    fontSize: 13,
    color: 'black',
    textAlign: 'center',
    marginTop: 4,
  },
  
 
});
