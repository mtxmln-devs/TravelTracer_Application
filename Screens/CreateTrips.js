import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';

    const initDB = async () => {
        try {
            const db = await SQLite.openDatabaseAsync('tripsDB');
            await db.execAsync(`
                CREATE TABLE IF NOT EXISTS trips (
                    tripId INTEGER PRIMARY KEY,
                    tripName TEXT NOT NULL,
                    destination TEXT NOT NULL,
                    startDate TEXT NOT NULL,
                    endDate TEXT NOT NULL
                );
            `);
            console.log('Database and "trips" table initialized.');
        } catch (error) {
            console.error('Error initializing the database:', error);
        }
    };

    const selectAllTrips = async () => {
        try {
            const db = await SQLite.openDatabaseAsync('tripsDB');
            const result = await db.getAllAsync('SELECT * FROM trips');
            console.log('All trips:', result);
            return result;
        } catch (error) {
            console.error('Error selecting trips:', error);
        }
    };

    export default function CreateTrips({ navigation }) {
        const [modalVisible, setModalVisible] = useState(false);
        const [updateModalVisible, setUpdateModalVisible] = useState(false);
        const [deleteModalVisible, setDeleteModalVisible] = useState(false);
        const [viewTripsModalVisible, setViewTripsModalVisible] = useState(false);
        const [formData, setFormData] = useState({
            tripId: '',
            tripName: '',
            destination: '',
            startDate: '',
            endDate: ''
        });
        const [tripIdToUpdate, setTripIdToUpdate] = useState('');
        const [tripIdToDelete, setTripIdToDelete] = useState('');
        const [allTrips, setAllTrips] = useState([]);

        useEffect(() => {
            initDB();
        }, []);

        const handleInputChange = (field, value) => {
            setFormData({ ...formData, [field]: value });
        };

        const insertTrip = async () => {
            const { tripId, tripName, destination, startDate, endDate } = formData;

            if (!tripId || !tripName || !destination || !startDate || !endDate) {
                Alert.alert('Error', 'Please fill out all fields.');
                return;
            }

            try {
                const db = await SQLite.openDatabaseAsync('tripsDB');
                const result = await db.runAsync(
                    'INSERT INTO trips (tripId, tripName, destination, startDate, endDate) VALUES (?, ?, ?, ?, ?)', 
                    tripId, 
                    tripName, 
                    destination, 
                    startDate, 
                    endDate
                );
                Alert.alert('Trip Created!', `New trip created with ID: ${tripId}`);
                console.log('Trip inserted with ID:', result.lastInsertRowId);

                setFormData({
                    tripId: '',
                    tripName: '',
                    destination: '',
                    startDate: '',
                    endDate: ''
                });

                setModalVisible(false);
            } catch (error) {
                console.error('Error inserting trip:', error);
            }
        };

        const updateTrip = async () => {
            const { tripName, destination, startDate, endDate } = formData;

            if (!tripIdToUpdate || !tripName || !destination || !startDate || !endDate) {
                Alert.alert('Error', 'Please fill out all fields.');
                return;
            }

            try {
                const db = await SQLite.openDatabaseAsync('tripsDB');
                await db.runAsync(
                    'UPDATE trips SET tripName = ?, destination = ?, startDate = ?, endDate = ? WHERE tripId = ?',
                    tripName,
                    destination,
                    startDate,
                    endDate,
                    tripIdToUpdate
                );
                Alert.alert('Trip Updated!', `Trip with ID: ${tripIdToUpdate} has been updated.`);
                console.log('Trip updated with ID:', tripIdToUpdate);

                setUpdateModalVisible(false);
            } catch (error) {
                console.error('Error updating trip:', error);
            }
        };

        const deleteTrip = async () => {
            if (!tripIdToDelete) {
                Alert.alert('Error', 'Please enter a valid Trip ID.');
                return;
            }

            try {
                const db = await SQLite.openDatabaseAsync('tripsDB');
                await db.runAsync('DELETE FROM trips WHERE tripId = ?', tripIdToDelete);
                Alert.alert('Trip Deleted!', `Trip with ID: ${tripIdToDelete} has been deleted.`);
                console.log('Trip deleted with ID:', tripIdToDelete);

                setDeleteModalVisible(false);
            } catch (error) {
                console.error('Error deleting trip:', error);
            }
        };

        const handleViewTrips = async () => {
            const trips = await selectAllTrips();
            setAllTrips(trips);
            setViewTripsModalVisible(true);
        };

        return (
            <View style={styles.container}>
                <Text style={styles.titleText}>TRIPS</Text>

                <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(true)}>
                    <Text style={styles.btnText}>CREATE TRIP</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(true)}>
                    <Text style={styles.btnText}>UPDATE TRIP</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={() => setDeleteModalVisible(true)}>
                    <Text style={styles.btnText}>DELETE TRIP</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={handleViewTrips}>
                    <Text style={styles.btnText}>VIEW ALL TRIPS</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.backBtn} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backBtnText}>BACK</Text>
                </TouchableOpacity>

                {/* View All Trips Modal */}
                <Modal visible={viewTripsModalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={styles.modalTitle}>All Trips</Text>
                            {allTrips && allTrips.length > 0 ? (
                                allTrips.map((trip, index) => (
                                    <View key={index} style={styles.tripItem}>
                                        <Text>Trip ID: {trip.tripId}</Text>
                                        <Text>Trip Name: {trip.tripName}</Text>
                                        <Text>Destination: {trip.destination}</Text>
                                        <Text>Start Date: {trip.startDate}</Text>
                                        <Text>End Date: {trip.endDate}</Text>
                                        <View style={styles.separator} />
                                    </View>
                                ))
                            ) : (
                                <Text>No trips available.</Text>
                            )}
                            <TouchableOpacity style={styles.btn} onPress={() => setViewTripsModalVisible(false)}>
                                <Text style={styles.btnText}>CLOSE</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Modal>

                {/* Insert Trip Modal */}
                <Modal visible={modalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={styles.modalTitle}>CREATE TRIPS</Text>

                            <TextInput 
                                style={styles.input} 
                                placeholder="Trip ID" 
                                value={formData.tripId} 
                                keyboardType="numeric"
                                onChangeText={(text) => handleInputChange('tripId', text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Trip Name" 
                                value={formData.tripName} 
                                onChangeText={(text) => handleInputChange('tripName', text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Destination" 
                                value={formData.destination} 
                                onChangeText={(text) => handleInputChange('destination', text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Start Date (YYYY-MM-DD)" 
                                value={formData.startDate} 
                                onChangeText={(text) => handleInputChange('startDate', text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="End Date (YYYY-MM-DD)" 
                                value={formData.endDate} 
                                onChangeText={(text) => handleInputChange('endDate', text)} 
                            />

                            {/* Center buttons vertically */}
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={styles.btn} onPress={insertTrip}>
                                    <Text style={styles.btnText}>SUBMIT</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.btnText}>CANCEL</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>

                {/* Update Trip Modal */}
                <Modal visible={updateModalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={styles.modalTitle}>Update Trip</Text>

                            <TextInput 
                                style={styles.input} 
                                placeholder="Enter Trip ID to Update" 
                                value={tripIdToUpdate} 
                                keyboardType="numeric"
                                onChangeText={(text) => setTripIdToUpdate(text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Trip Name" 
                                value={formData.tripName} 
                                onChangeText={(text) => handleInputChange('tripName', text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Destination" 
                                value={formData.destination} 
                                onChangeText={(text) => handleInputChange('destination', text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="Start Date (YYYY-MM-DD)" 
                                value={formData.startDate} 
                                onChangeText={(text) => handleInputChange('startDate', text)} 
                            />
                            <TextInput 
                                style={styles.input} 
                                placeholder="End Date (YYYY-MM-DD)" 
                                value={formData.endDate} 
                                onChangeText={(text) => handleInputChange('endDate', text)} 
                            />

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={styles.btn} onPress={updateTrip}>
                                    <Text style={styles.btnText}>UPDATE</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(false)}>
                                    <Text style={styles.btnText}>CANCEL</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>

                {/* Delete Trip Modal */}
                <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={styles.modalTitle}>Delete Trip</Text>

                            <TextInput 
                                style={styles.input} 
                                placeholder="Enter Trip ID to Delete" 
                                value={tripIdToDelete} 
                                keyboardType="numeric"
                                onChangeText={(text) => setTripIdToDelete(text)} 
                            />

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={styles.btn} onPress={deleteTrip}>
                                    <Text style={styles.btnText}>DELETE</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btn} onPress={() => setDeleteModalVisible(false)}>
                                    <Text style={styles.btnText}>CANCEL</Text>
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
            justifyContent: 'center', // Center the buttons vertically
            alignItems: 'center', // Center the buttons horizontally
            marginTop: 20,
    },
});
