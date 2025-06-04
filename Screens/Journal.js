import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Text, TextInput, Alert, Modal } from "react-native";
import * as SQLite from 'expo-sqlite';

let db;

async function openDatabase() {
  db = await SQLite.openDatabaseAsync("memoriesDB");
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      memoryText TEXT NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export default function Journal() {
  const [memoryText, setMemoryText] = useState("");
  const [memoryId, setMemoryId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(""); // "update" or "delete"

  useEffect(() => {
    openDatabase().catch((error) => Alert.alert("Database Error", error.message));
  }, []);

  // Function to add a travel memory to the SQLite database
  const addTravelMemory = async () => {
    console.log(`Save memory with ID: ${memoryText}`);
    if (!memoryText.trim()) {
      Alert.alert("Validation Error", "Memory text cannot be empty.");
      return;
    }

    try {
      const result = await db.runAsync(
        'INSERT INTO memories (memoryText) VALUES (?);', 
        [memoryText]
      );
      Alert.alert("Success", "Travel memory saved successfully! Row ID: " + result.lastInsertRowId);
      console.log(`Save memory with ID: ${result.lastInsertRowId}`);
      setMemoryText(""); // Clear the input field
    } catch (error) {
      Alert.alert("Error", "Failed to save memory: " + error.message);
    }
  };

  // Function to get all travel memories from the database
  const getAllMemories = async () => {
    console.log("View memories with all IDs");
    try {
      const allRows = await db.getAllAsync('SELECT * FROM memories');
      let message = "All Memories:\n";
      allRows.forEach(row => {
        message += `ID: ${row.id}, Memory: ${row.memoryText}\n`;
        console.log(`ID: ${row.id}, Memory: ${row.memoryText}`); // This will print each memory to the console
      });
      Alert.alert("All Memories", message);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch all memories: " + error.message);
    }
  };

  // Function to update a travel memory by ID
  const updateMemoryById = async () => {
    console.log(`Updated memory with ID: ${memoryId}`);
    if (!memoryText.trim()) {
      Alert.alert("Validation Error", "Memory text cannot be empty.");
      return;
    }
    if (!memoryId) {
      Alert.alert("Validation Error", "Please provide a valid ID.");
      return;
    }
    try {
      const result = await db.runAsync('UPDATE memories SET memoryText = ? WHERE id = ?;', [memoryText, memoryId]);
      Alert.alert("Success", `Memory updated successfully! Rows affected: ${result.changes}`);
      console.log(`Updated memory with ID: ${memoryId}`);
      setModalVisible(false);
      setMemoryText(""); // Clear input after update
      setMemoryId(""); // Clear ID
    } catch (error) {
      Alert.alert("Error", "Failed to update memory: " + error.message);
    }
  };

  // Function to delete a travel memory by ID
  const deleteMemoryById = async () => {
    console.log(`Deleted memory with ID: ${memoryId}`);
    if (!memoryId) {
      Alert.alert("Validation Error", "Please provide a valid ID.");
      return;
    }
    try {
      const result = await db.runAsync('DELETE FROM memories WHERE id = ?', memoryId);
      Alert.alert("Success", `Memory deleted successfully! Rows affected: ${result.changes}`);
      console.log(`Deleted memory with ID: ${memoryId}`);
      setModalVisible(false);
      setMemoryText(""); // Clear input
      setMemoryId(""); // Clear ID
    } catch (error) {
      Alert.alert("Error", "Failed to delete memory: " + error.message);
    }
  };

  // Toggle the modal and set action type (update or delete)
  const openModal = (action) => {
    console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} Memory button pressed`);
    setModalAction(action);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>JOURNAL</Text>
      
      <Image
        source={require("../assets/openBook.png")}
        style={styles.homeIcon}
      />

      <TextInput
        style={styles.textInput}
        placeholder="Write your travel memory here..."
        multiline={true}
        value={memoryText}
        onChangeText={setMemoryText}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.ovalButton} onPress={addTravelMemory}>
          <Text style={styles.buttonText}>Save travel memory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ovalButton} onPress={getAllMemories}>
          <Text style={styles.buttonText}>View Memories</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ovalButton} onPress={() => openModal("update")}>
          <Text style={styles.buttonText}>Update Memory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ovalButton} onPress={() => openModal("delete")}>
          <Text style={styles.buttonText}>Delete Memory</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Update/Delete */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Memory ID</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Memory ID"
              keyboardType="numeric"
              value={memoryId}
              onChangeText={setMemoryId}
            />
            <TextInput
              style={styles.textInput}
              placeholder={modalAction === "update" ? "New Memory Text" : ""}
              value={memoryText}
              onChangeText={setMemoryText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={modalAction === "update" ? updateMemoryById : deleteMemoryById}
              >
                <Text style={styles.buttonText}>{modalAction === "update" ? "Update" : "Delete"} Memory</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CA8787",
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 110,
    marginLeft: 20,
  },
  homeIcon: {
    width: 320,
    height: 250,
    marginTop: -150,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 25,
    flexWrap: "wrap",
    alignItems: 'center',
  },
  ovalButton: {
    backgroundColor: "white",
    paddingVertical: 25,
    paddingHorizontal: 25,
    borderRadius: 30, 
    margin: 15,
    shadowColor: "#000",
    elevation: 2,
    width: 350,
  },
  buttonText: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  textInput: {
    width: '90%',
    height: 60,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    marginTop: 20,
    shadowColor: "#000",
    elevation: 2,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30, 
    shadowColor: "#000",
    elevation: 2,
  },
});
