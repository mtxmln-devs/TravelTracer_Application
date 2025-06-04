import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from 'react-native'; // COMPONENTS USED IN THIS TAB
import * as SQLite from 'expo-sqlite'; // LOCAL DATABASE FOR STORAGE OF DATA

const initDB = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('destinationsDB'); // OPENS THE DATABASE
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS destinations (
                destinationID INTEGER PRIMARY KEY,
                destinationName TEXT NOT NULL,
                location TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL
            );
        `); // CREATE TABLE WITH THE FOLLOWING VALUES ABOVE
        console.log('Database and "destinations" table initialized.');
    } catch (error) {
        console.error('Error initializing the database:', error); // LOGS IF THERE'S ERROR DURING INITIALIZATION
    }
};

// SELECT FUNCTION
const selectAllDestinations = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('destinationsDB'); 
        const result = await db.getAllAsync('SELECT * FROM destinations'); // Get all rows from the table
        console.log('All destinations:', result); // Log the retrieved destinations
        return result; // Return the result 
    } catch (error) {
        console.error('Error selecting destinations:', error);
    }
};

export default function CreateDestinations({ navigation }) {
    // STATE VARIABLES FOR MODAL OF FOUR BUTTONS THAT POPS MODAL WHEN THE BUTTONS ARE CLICKED
    const [modalVisible, setModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [viewDestinationsModalVisible, setViewDestinationsModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        destinationID: '',
        destinationName: '',
        location: '',
        description: '',
        category: ''
    });
    const [destinationIDToUpdate, setDestinationIDToUpdate] = useState(''); // STATE FOR ID TO UPDATE
    const [destinationIDToDelete, setDestinationIDToDelete] = useState(''); // STATE FOR ID TO DELETE
    const [allDestinations, setAllDestinations] = useState([]); // STATE FOR ALL DESTINATIONS DATA

    // Run the initDB function once when the component mounts
    useEffect(() => {
        initDB();
    }, []);

    // Handle input changes and update the formData state
    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value }); // Update the specific field in formData
    };

    // INSERT FUNCTION
    const insertDestination = async () => {
        const { destinationID, destinationName, location, description, category } = formData;

        // Check if any field is empty
        if (!destinationID || !destinationName || !location || !description || !category) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('destinationsDB');
            const result = await db.runAsync(
                'INSERT INTO destinations (destinationID, destinationName, location, description, category) VALUES (?, ?, ?, ?, ?)', 
                destinationID, 
                destinationName, 
                location, 
                description, 
                category
            );
            Alert.alert('Destination Created!', `New destination created with ID: ${destinationID}`);
            console.log('Destination inserted with ID:', result.lastInsertRowId); 

            // Reset form data after successful submission
            setFormData({
                destinationID: '',
                destinationName: '',
                location: '',
                description: '',
                category: ''
            });

            setModalVisible(false); // Close the modal after submission
        } catch (error) {
            console.error('Error inserting destination:', error);
        }
    };

    // UPDATE FUNCTION
    const updateDestination = async () => {
        const { destinationName, location, description, category } = formData;

        // Check if any field is empty
        if (!destinationIDToUpdate || !destinationName || !location || !description || !category) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('destinationsDB');
            await db.runAsync(
                'UPDATE destinations SET destinationName = ?, location = ?, description = ?, category = ? WHERE destinationID = ?',
                destinationName,
                location,
                description,
                category,
                destinationIDToUpdate
            );
            Alert.alert('Destination Updated!', `Destination with ID: ${destinationIDToUpdate} has been updated.`);
            console.log('Destination updated with ID:', destinationIDToUpdate);

            setUpdateModalVisible(false); // Close update modal after successful update
        } catch (error) {
            console.error('Error updating destination:', error);
        }
    };

    // DELETE FUNCTION
    const deleteDestination = async () => {
        if (!destinationIDToDelete) {
            Alert.alert('Error', 'Please enter a valid Destination ID.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('destinationsDB');
            await db.runAsync('DELETE FROM destinations WHERE destinationID = ?', destinationIDToDelete);
            Alert.alert('Destination Deleted!', `Destination with ID: ${destinationIDToDelete} has been deleted.`);
            console.log('Destination deleted with ID:', destinationIDToDelete);

            setDeleteModalVisible(false); // Close delete modal after successful deletion
        } catch (error) {
            console.error('Error deleting destination:', error);
        }
    };

    const handleViewDestinations = async () => {
        const destinations = await selectAllDestinations(); // Fetch all destinations
        setAllDestinations(destinations); // Update state with the list of destinations
        setViewDestinationsModalVisible(true); // Show the modal with all destinations
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>DESTINATIONS</Text>

            <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(true)}>
                <Text style={styles.btnText}>CREATE DESTINATION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(true)}>
                <Text style={styles.btnText}>UPDATE DESTINATION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => setDeleteModalVisible(true)}>
                <Text style={styles.btnText}>DELETE DESTINATION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={handleViewDestinations}>
                <Text style={styles.btnText}>VIEW ALL DESTINATIONS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.backBtn} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backBtnText}>BACK</Text>
            </TouchableOpacity>

            {/* View All Destinations Modal */}
            <Modal visible={viewDestinationsModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>All Destinations</Text>
                        {allDestinations && allDestinations.length > 0 ? (
                            allDestinations.map((destination, index) => (
                                <View key={index} style={styles.tripItem}>
                                    <Text>Destination ID: {destination.destinationID}</Text>
                                    <Text>Destination Name: {destination.destinationName}</Text>
                                    <Text>Location: {destination.location}</Text>
                                    <Text>Description: {destination.description}</Text>
                                    <Text>Category: {destination.category}</Text>
                                    <View style={styles.separator} />
                                </View>
                            ))
                        ) : (
                            <Text>No destinations available.</Text>
                        )}
                        <TouchableOpacity style={styles.btn} onPress={() => setViewDestinationsModalVisible(false)}>
                            <Text style={styles.btnText}>CLOSE</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Insert Destination Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>CREATE DESTINATION</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Destination ID" 
                            value={formData.destinationID} 
                            keyboardType="numeric"
                            onChangeText={(text) => handleInputChange('destinationID', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Destination Name" 
                            value={formData.destinationName} 
                            onChangeText={(text) => handleInputChange('destinationName', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Location" 
                            value={formData.location} 
                            onChangeText={(text) => handleInputChange('location', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Description" 
                            value={formData.description} 
                            onChangeText={(text) => handleInputChange('description', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Category" 
                            value={formData.category} 
                            onChangeText={(text) => handleInputChange('category', text)} 
                        />

                        <TouchableOpacity style={styles.btn} onPress={insertDestination}>
                            <Text style={styles.btnText}>SUBMIT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.btnText}>CANCEL</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Update Destination Modal */}
            <Modal visible={updateModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Destination</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter Destination ID to Update" 
                            value={destinationIDToUpdate} 
                            keyboardType="numeric"
                            onChangeText={(text) => setDestinationIDToUpdate(text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Destination Name" 
                            value={formData.destinationName} 
                            onChangeText={(text) => handleInputChange('destinationName', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Location" 
                            value={formData.location} 
                            onChangeText={(text) => handleInputChange('location', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Description" 
                            value={formData.description} 
                            onChangeText={(text) => handleInputChange('description', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Category" 
                            value={formData.category} 
                            onChangeText={(text) => handleInputChange('category', text)} 
                        />

                        <TouchableOpacity style={styles.btn} onPress={updateDestination}>
                            <Text style={styles.btnText}>UPDATE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(false)}>
                            <Text style={styles.btnText}>CANCEL</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Delete Destination Modal */}
            <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete Destination</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter Destination ID to Delete" 
                            value={destinationIDToDelete} 
                            keyboardType="numeric"
                            onChangeText={(text) => setDestinationIDToDelete(text)} 
                        />

                        <TouchableOpacity style={styles.btn} onPress={deleteDestination}>
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
        backgroundColor: '#674636', 
        borderRadius: 20, 
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3, 
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
        transform: [{ translateX: -75 }], 
        width: 240, 
        height: 65, 
        backgroundColor: '#674636', 
        borderRadius: 40, 
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, 
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    modalContent: {
        width: 350,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginTop: 70,
        justifyContent: 'center', 
        alignItems: 'center', 
    },
    modalTitle: {
        fontSize: 50,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        marginTop: -1,
        height: 50,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 13,
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
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 20,
    },
});
