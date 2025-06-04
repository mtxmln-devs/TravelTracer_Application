import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native'; // COMPONENTS FOR THIS TAB
import * as SQLite from 'expo-sqlite'; // LOCAL DATABASE STORAGE

const initDB = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('remindersDB'); // OPENS DATABASE
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS reminders (
                ReminderID INTEGER PRIMARY KEY,
                ReminderName TEXT NOT NULL,
                ReminderDate TEXT NOT NULL
            );
        `); // CREATES TABLE WITH CORRESPONDING VALUES
        console.log('Database and "reminders" table initialized.');
    } catch (error) {
        console.error('Error initializing the database:', error);
    }
};

// VIEW FUNCTION
const selectAllReminders = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('remindersDB');
        const result = await db.getAllAsync('SELECT * FROM reminders');
        console.log('All reminders:', result);
        return result; // RETURN THE RESULT
    } catch (error) {
        console.error('Error selecting reminders:', error);
    }
};

export default function CreateReminders({ navigation }) {
    // STATE VARIABLES FOR MODAL FOUR BUTTONS 
    const [modalVisible, setModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [viewRemindersModalVisible, setViewRemindersModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        ReminderID: '',
        ReminderName: '',
        ReminderDate: ''
    });
    const [reminderIDToUpdate, setReminderIDToUpdate] = useState(''); // STATE FOR ID TO UPDATE
    const [reminderIDToDelete, setReminderIDToDelete] = useState(''); // STATE FOR ID TO DELETE
    const [allReminders, setAllReminders] = useState([]); // STATE FOR ALL REMINDERS DATA

    // Run the initDB function once when the component mounts
    useEffect(() => {
        initDB();
    }, []);

    // Handle input changes and update the formData state
    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    // INSERT FUNCTION
    const insertReminder = async () => {
        const { ReminderID, ReminderName, ReminderDate } = formData;

        // Check if any field is empty
        if (!ReminderID || !ReminderName || !ReminderDate) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('remindersDB');
            const result = await db.runAsync(
                'INSERT INTO reminders (ReminderID, ReminderName, ReminderDate) VALUES (?, ?, ?)', 
                ReminderID, 
                ReminderName, 
                ReminderDate
            );
            Alert.alert('Reminder Created!', `New reminder created with ID: ${ReminderID}`);
            setFormData({ ReminderID: '', ReminderName: '', ReminderDate: '' });
            setModalVisible(false);
        } catch (error) {
            console.error('Error inserting reminder:', error);
        }
    };

    // UPDATE FUNCTION
    const updateReminder = async () => {
        const { ReminderName, ReminderDate } = formData;

        if (!reminderIDToUpdate || !ReminderName || !ReminderDate) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('remindersDB');
            await db.runAsync(
                'UPDATE reminders SET ReminderName = ?, ReminderDate = ? WHERE ReminderID = ?',
                ReminderName,
                ReminderDate,
                reminderIDToUpdate
            );
            Alert.alert('Reminder Updated!', `Reminder with ID: ${reminderIDToUpdate} has been updated.`);
            setUpdateModalVisible(false);
        } catch (error) {
            console.error('Error updating reminder:', error);
        }
    };

    // DELETE FUNCTION
    const deleteReminder = async () => {
        if (!reminderIDToDelete) {
            Alert.alert('Error', 'Please enter a valid Reminder ID.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('remindersDB');
            await db.runAsync('DELETE FROM reminders WHERE ReminderID = ?', reminderIDToDelete);
            Alert.alert('Reminder Deleted!', `Reminder with ID: ${reminderIDToDelete} has been deleted.`);
            setDeleteModalVisible(false);
        } catch (error) {
            console.error('Error deleting reminder:', error);
        }
    };

    const handleViewReminders = async () => {
        const reminders = await selectAllReminders();
        setAllReminders(reminders);
        setViewRemindersModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>REMINDERS</Text>

            <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(true)}>
                <Text style={styles.btnText}>CREATE REMINDER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(true)}>
                <Text style={styles.btnText}>UPDATE REMINDER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => setDeleteModalVisible(true)}>
                <Text style={styles.btnText}>DELETE REMINDER</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={handleViewReminders}>
                <Text style={styles.btnText}>VIEW ALL REMINDERS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.backBtn} 
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backBtnText}>BACK</Text>
            </TouchableOpacity>

            {/* View All Reminders Modal */}
            <Modal visible={viewRemindersModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>All Reminders</Text>
                        {allReminders && allReminders.length > 0 ? (
                            allReminders.map((reminder, index) => (
                                <View key={index} style={styles.reminderItem}>
                                    <Text>Reminder ID: {reminder.ReminderID}</Text>
                                    <Text>Reminder Name: {reminder.ReminderName}</Text>
                                    <Text>Reminder Date: {reminder.ReminderDate}</Text>
                                    <View style={styles.separator} />
                                </View>
                            ))
                        ) : (
                            <Text>No reminders available.</Text>
                        )}
                        <TouchableOpacity style={styles.btn} onPress={() => setViewRemindersModalVisible(false)}>
                            <Text style={styles.btnText}>CLOSE</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Insert Reminder Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>CREATE REMINDER</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Reminder ID" 
                            value={formData.ReminderID} 
                            keyboardType="numeric"
                            onChangeText={(text) => handleInputChange('ReminderID', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Reminder Name" 
                            value={formData.ReminderName} 
                            onChangeText={(text) => handleInputChange('ReminderName', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Reminder Date (YYYY-MM-DD)" 
                            value={formData.ReminderDate} 
                            onChangeText={(text) => handleInputChange('ReminderDate', text)} 
                        />

                        <TouchableOpacity style={styles.btn} onPress={insertReminder}>
                            <Text style={styles.btnText}>SUBMIT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.btnText}>CANCEL</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Update Reminder Modal */}
            <Modal visible={updateModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Reminder</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter Reminder ID to Update" 
                            value={reminderIDToUpdate} 
                            keyboardType="numeric"
                            onChangeText={(text) => setReminderIDToUpdate(text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Reminder Name" 
                            value={formData.ReminderName} 
                            onChangeText={(text) => handleInputChange('ReminderName', text)} 
                        />

                        <TextInput 
                            style={styles.input} 
                            placeholder="Reminder Date" 
                            value={formData.ReminderDate} 
                            onChangeText={(text) => handleInputChange('ReminderDate', text)} 
                        />

                        <TouchableOpacity style={styles.btn} onPress={updateReminder}>
                            <Text style={styles.btnText}>UPDATE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(false)}>
                            <Text style={styles.btnText}>CANCEL</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Delete Reminder Modal */}
            <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete Reminder</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter Reminder ID to Delete" 
                            value={reminderIDToDelete} 
                            keyboardType="numeric"
                            onChangeText={(text) => setReminderIDToDelete(text)} 
                        />

                        <TouchableOpacity style={styles.btn} onPress={deleteReminder}>
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
    reminderItem: {
        marginBottom: 10,
    },
});

