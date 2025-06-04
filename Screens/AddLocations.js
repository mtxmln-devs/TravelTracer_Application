import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

const initDB = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('locationsDB');
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS locations (
                LocationID INTEGER PRIMARY KEY,
                LocationName TEXT NOT NULL,
                Coordinates TEXT NOT NULL
            );
        `);
        console.log('Database and "locations" table initialized.');
    } catch (error) {
        console.error('Error initializing the database:', error);
    }
};

const selectAllLocations = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('locationsDB');
        const result = await db.getAllAsync('SELECT * FROM locations');
        console.log('All locations:', result);
        return result;
    } catch (error) {
        console.error('Error selecting locations:', error);
    }
};

export default function CreateLocations({ navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [viewLocationsModalVisible, setViewLocationsModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        LocationID: '',
        LocationName: '',
        Coordinates: ''
    });
    const [locationIDToUpdate, setLocationIDToUpdate] = useState('');
    const [locationIDToDelete, setLocationIDToDelete] = useState('');
    const [allLocations, setAllLocations] = useState([]);

    useEffect(() => {
        initDB();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const insertLocation = async () => {
        const { LocationID, LocationName, Coordinates } = formData;

        if (!LocationID || !LocationName || !Coordinates) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('locationsDB');
            const result = await db.runAsync(
                'INSERT INTO locations (LocationID, LocationName, Coordinates) VALUES (?, ?, ?)', 
                LocationID, 
                LocationName, 
                Coordinates
            );
            Alert.alert('Location Created!', `New location created with ID: ${LocationID}`);
            setFormData({ LocationID: '', LocationName: '', Coordinates: '' });
            setModalVisible(false);
        } catch (error) {
            console.error('Error inserting location:', error);
        }
    };

    const updateLocation = async () => {
        const { LocationName, Coordinates } = formData;

        if (!locationIDToUpdate || !LocationName || !Coordinates) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('locationsDB');
            await db.runAsync(
                'UPDATE locations SET LocationName = ?, Coordinates = ? WHERE LocationID = ?',
                LocationName,
                Coordinates,
                locationIDToUpdate
            );
            Alert.alert('Location Updated!', `Location with ID: ${locationIDToUpdate} has been updated.`);
            setUpdateModalVisible(false);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const deleteLocation = async () => {
        if (!locationIDToDelete) {
            Alert.alert('Error', 'Please enter a valid Location ID.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('locationsDB');
            await db.runAsync('DELETE FROM locations WHERE LocationID = ?', locationIDToDelete);
            Alert.alert('Location Deleted!', `Location with ID: ${locationIDToDelete} has been deleted.`);
            setDeleteModalVisible(false);
        } catch (error) {
            console.error('Error deleting location:', error);
        }
    };

    const handleViewLocations = async () => {
        const locations = await selectAllLocations();
        setAllLocations(locations);
        setViewLocationsModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>LOCATIONS</Text>

            <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(true)}>
                <Text style={styles.btnText}>CREATE LOCATION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(true)}>
                <Text style={styles.btnText}>UPDATE LOCATION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => setDeleteModalVisible(true)}>
                <Text style={styles.btnText}>DELETE LOCATION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={handleViewLocations}>
                <Text style={styles.btnText}>VIEW ALL LOCATIONS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.backBtn} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backBtnText}>BACK</Text>
            </TouchableOpacity>

            {/* View All Locations Modal */}
            <Modal visible={viewLocationsModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>All Locations</Text>
                        {allLocations && allLocations.length > 0 ? (
                            allLocations.map((location, index) => (
                                <View key={index} style={styles.locationItem}>
                                    <Text>Location ID: {location.LocationID}</Text>
                                    <Text>Location Name: {location.LocationName}</Text>
                                    <Text>Coordinates: {location.Coordinates}</Text>
                                    <View style={styles.separator} />
                                </View>
                            ))
                        ) : (
                            <Text>No locations available.</Text>
                        )}
                        <TouchableOpacity style={styles.btn} onPress={() => setViewLocationsModalVisible(false)}>
                            <Text style={styles.btnText}>CLOSE</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Insert Location Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>CREATE LOCATION</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Location ID" 
                            value={formData.LocationID} 
                            keyboardType="numeric"
                            onChangeText={(text) => handleInputChange('LocationID', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Location Name" 
                            value={formData.LocationName} 
                            onChangeText={(text) => handleInputChange('LocationName', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Coordinates (lat, long)" 
                            value={formData.Coordinates} 
                            onChangeText={(text) => handleInputChange('Coordinates', text)} 
                        />

                        <TouchableOpacity style={styles.btn} onPress={insertLocation}>
                            <Text style={styles.btnText}>SUBMIT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.btnText}>CANCEL</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Update Location Modal */}
            <Modal visible={updateModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Location</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter Location ID to Update" 
                            value={locationIDToUpdate} 
                            keyboardType="numeric"
                            onChangeText={(text) => setLocationIDToUpdate(text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Location Name" 
                            value={formData.LocationName} 
                            onChangeText={(text) => handleInputChange('LocationName', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Coordinates" 
                            value={formData.Coordinates} 
                            onChangeText={(text) => handleInputChange('Coordinates', text)} 
                        />

                        <TouchableOpacity style={styles.btn} onPress={updateLocation}>
                            <Text style={styles.btnText}>UPDATE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(false)}>
                            <Text style={styles.btnText}>CANCEL</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Delete Location Modal */}
            <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete Location</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter Location ID to Delete" 
                            value={locationIDToDelete} 
                            keyboardType="numeric"
                            onChangeText={(text) => setLocationIDToDelete(text)} 
                        />

                        <TouchableOpacity style={styles.btn} onPress={deleteLocation}>
                            <Text style={styles.btnText}>DELETE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btn} onPress={() => setDeleteModalVisible(false)}>
                            <Text style={styles.btnText}>CANCEL</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFC785',
},
titleText: {
    marginTop: -50,
    marginBottom: 100,
    fontSize: 50,
    fontWeight: 'bold',
},
btn: {
    marginBottom: 25,
    width: 300,
    height: 60,
    backgroundColor: '#674636', // Brown color
    borderRadius: 20, // Half of height (75 / 2 = 37.5) to make it oval
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Adds a shadow for depth
},
btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
},
backBtn: {
    position: 'absolute',
    bottom: 30,
    left: '38%',
    transform: [{ translateX: -75 }], // Center the button
    width: 240, // Width of button
    height: 65, // Height of button
    backgroundColor: '#674636', // Brown color
    borderRadius: 40, // Half of the height to make it oval
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Adds a shadow for depth
},
backBtnText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
},
modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
},
modalContent: {
    width: 350,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginTop: 70,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
},
modalTitle: {
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
},
input: {
    marginTop: 5,
    height: 50,
    borderColor: 'black',
    borderWidth: 1,
    width: 300,
    marginBottom: 20,
    paddingLeft: 10,
},
separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
},
tripItem: {
    marginBottom: 10,
},
modalButtonContainer: {
    justifyContent: 'center', // Center the buttons vertically
    alignItems: 'center', // Center the buttons horizontally
    marginTop: 20,
},
});

