import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Modal, TextInput, ScrollView, Image } from 'react-native';
import * as SQLite from 'expo-sqlite';

const initDB = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('friendsDB');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        age INTEGER NOT NULL,
        address TEXT NOT NULL
      );
    `);
    console.log('Database and "friends" table initialized.');
  } catch (error) {
    console.error('Error initializing the database:', error);
  }
};

const selectAllFriends = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('friendsDB');
    const result = await db.getAllAsync('SELECT * FROM friends');
    console.log('All friends:', result);
    return result;
  } catch (error) {
    console.error('Error selecting friends:', error);
  }
};

export default function Social() {
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [viewFriendsModalVisible, setViewFriendsModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    gender: '',
    age: '',
    address: ''
  });
  const [friendIdToUpdate, setFriendIdToUpdate] = useState('');
  const [friendIdToDelete, setFriendIdToDelete] = useState('');
  const [allFriends, setAllFriends] = useState([]);

  useEffect(() => {
    initDB();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const insertFriend = async () => {
    const { id, name, gender, age, address } = formData;

    if (!id || !name || !gender || !age || !address) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync('friendsDB');
      const result = await db.runAsync(
        'INSERT INTO friends (id, name, gender, age, address) VALUES (?, ?, ?, ?, ?)',
        id,
        name,
        gender,
        age,
        address
      );
      Alert.alert('Friend Added!', `New friend added with ID: ${id}`);
      console.log('Friend inserted with ID:', result.lastInsertRowId);

      setFormData({
        id: '',
        name: '',
        gender: '',
        age: '',
        address: ''
      });

      setModalVisible(false);
    } catch (error) {
      console.error('Error inserting friend:', error);
    }
  };

  const updateFriend = async () => {
    const { name, gender, age, address } = formData;

    if (!friendIdToUpdate || !name || !gender || !age || !address) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync('friendsDB');
      await db.runAsync(
        'UPDATE friends SET name = ?, gender = ?, age = ?, address = ? WHERE id = ?',
        name,
        gender,
        age,
        address,
        friendIdToUpdate
      );
      Alert.alert('Friend Updated!', `Friend with ID: ${friendIdToUpdate} has been updated.`);
      console.log('Friend updated with ID:', friendIdToUpdate);

      setUpdateModalVisible(false);
    } catch (error) {
      console.error('Error updating friend:', error);
    }
  };

  const deleteFriend = async () => {
    if (!friendIdToDelete) {
      Alert.alert('Error', 'Please enter a valid Friend ID.');
      return;
    }

    try {
      const db = await SQLite.openDatabaseAsync('friendsDB');
      await db.runAsync('DELETE FROM friends WHERE id = ?', friendIdToDelete);
      Alert.alert('Friend Deleted!', `Friend with ID: ${friendIdToDelete} has been deleted.`);
      console.log('Friend deleted with ID:', friendIdToDelete);

      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting friend:', error);
    }
  };

  const handleViewFriends = async () => {
    console.log('View Friend List button pressed');
    const friends = await selectAllFriends();
    setAllFriends(friends);
    setViewFriendsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>SOCIALS</Text>
      <Image
        source={require('../assets/socialImage.png')}
        style={styles.socialPic}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.ovalButton}
          onPress={() => {
            console.log('Add New Friends button pressed');
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Add New Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ovalButton}
          onPress={handleViewFriends}
        >
          <Text style={styles.buttonText}>View Friend List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ovalButton}
          onPress={() => {
            console.log("Update Friend's Name button pressed");
            setUpdateModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Update Friend's Name</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ovalButton}
          onPress={() => {
            console.log('Delete Friends button pressed');
            setDeleteModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Delete Friends</Text>
        </TouchableOpacity>
      </View>

      {/* View All Friends Modal */}
      <Modal visible={viewFriendsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>All Friends</Text>
            {allFriends && allFriends.length > 0 ? (
              allFriends.map((friend, index) => (
                <View key={index} style={styles.friendItem}>
                  <Text>Friend ID: {friend.id}</Text>
                  <Text>Name: {friend.name}</Text>
                  <Text>Gender: {friend.gender}</Text>
                  <Text>Age: {friend.age}</Text>
                  <Text>Address: {friend.address}</Text>
                  <View style={styles.separator} />
                </View>
              ))
            ) : (
              <Text>No friends available.</Text>
            )}
            <TouchableOpacity
              style={styles.ovalButton}
              onPress={() => setViewFriendsModalVisible(false)}
            >
              <Text style={styles.buttonText}>CLOSE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Insert Friend Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Friend</Text>

            <TextInput
              style={styles.input}
              placeholder="Friend ID"
              value={formData.id}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange('id', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Gender"
              value={formData.gender}
              onChangeText={(text) => handleInputChange('gender', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={formData.age}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange('age', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.ovalButton} onPress={insertFriend}>
                <Text style={styles.buttonText}>SUBMIT</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ovalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Update Friend Modal */}
      <Modal visible={updateModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Friend</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Friend ID to Update"
              value={friendIdToUpdate}
              keyboardType="numeric"
              onChangeText={(text) => setFriendIdToUpdate(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Gender"
              value={formData.gender}
              onChangeText={(text) => handleInputChange('gender', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={formData.age}
              keyboardType="numeric"
              onChangeText={(text) => handleInputChange('age', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.ovalButton} onPress={updateFriend}>
                <Text style={styles.buttonText}>UPDATE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ovalButton} onPress={() => setUpdateModalVisible(false)}>
                <Text style={styles.buttonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Friend Modal */}
      <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Friend</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Friend ID to Delete"
              value={friendIdToDelete}
              keyboardType="numeric"
              onChangeText={(text) => setFriendIdToDelete(text)}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.ovalButton} onPress={deleteFriend}>
                <Text style={styles.buttonText}>DELETE</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.ovalButton} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.buttonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#91DDCF",
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 50,
    marginLeft: -200,
  },
  socialPic: {
    width: 280,
    height: 200,
    marginTop: -150,
    marginLeft: 210,
  },
  buttonContainer: {
    justifyContent: 'center',
    width: 300,
    marginTop: 15,
    alignItems: 'center',
  },
  ovalButton: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 30, 
    margin: 15,
    shadowColor: "#000",
    elevation: 2,
    width: 300,
    display: 'center',
    height: 75,
  },
  buttonText: {
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 360,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
    height: 550,
    marginTop: 200,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  modalButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginVertical: 10,
    width: '100%',
  },
  friendItem: {
    padding: 10,
    marginBottom: 10,
  },
});
