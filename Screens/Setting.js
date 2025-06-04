import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, Modal, TextInput, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';

const initDB = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('USERDB');
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS USERS (
                userId INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                phoneNumber TEXT NOT NULL,
                email TEXT NOT NULL,
                address TEXT NOT NULL,
                gender TEXT NOT NULL
            );
        `);
        console.log('Database and "USERS" table initialized.');
    } catch (error) {
        console.error('Error initializing the database:', error);
    }
};

const selectAllUsers = async () => {
    try {
        const db = await SQLite.openDatabaseAsync('USERDB');
        const result = await db.getAllAsync('SELECT * FROM USERS');
        console.log('All users:', result);
        return result;
    } catch (error) {
        console.error('Error selecting users:', error);
    }
};

export default function Settings({ navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [viewUsersModalVisible, setViewUsersModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        phoneNumber: '',
        email: '',
        address: '',
        gender: '',
    });
    const [userIdToUpdate, setUserIdToUpdate] = useState('');
    const [userIdToDelete, setUserIdToDelete] = useState('');
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        initDB();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const insertUser = async () => {
        const { userId, name, phoneNumber, email, address, gender } = formData;

        if (!userId || !name || !phoneNumber || !email || !address || !gender) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('USERDB');
            const result = await db.runAsync(
                'INSERT INTO USERS (userId, name, phoneNumber, email, address, gender) VALUES (?, ?, ?, ?, ?, ?)', 
                userId, 
                name, 
                phoneNumber, 
                email, 
                address, 
                gender
            );
            Alert.alert('User Created!', `New user created with ID: ${userId}`);
            console.log('User inserted with ID:', result.lastInsertRowId);

            setFormData({
                userId: '',
                name: '',
                phoneNumber: '',
                email: '',
                address: '',
                gender: '',
            });

            setModalVisible(false);
        } catch (error) {
            console.error('Error inserting user:', error);
        }
    };

    const updateUser = async () => {
        const { name, phoneNumber, email, address, gender } = formData;

        if (!userIdToUpdate || !name || !phoneNumber || !email || !address || !gender) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('USERDB');
            await db.runAsync(
                'UPDATE USERS SET name = ?, phoneNumber = ?, email = ?, address = ?, gender = ? WHERE userId = ?',
                name,
                phoneNumber,
                email,
                address,
                gender,
                userIdToUpdate
            );
            Alert.alert('User Updated!', `User with ID: ${userIdToUpdate} has been updated.`);
            console.log('User updated with ID:', userIdToUpdate);

            setUpdateModalVisible(false);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const deleteUser = async () => {
        if (!userIdToDelete) {
            Alert.alert('Error', 'Please enter a valid User ID.');
            return;
        }

        try {
            const db = await SQLite.openDatabaseAsync('USERDB');
            await db.runAsync('DELETE FROM USERS WHERE userId = ?', userIdToDelete);
            Alert.alert('User Deleted!', `User with ID: ${userIdToDelete} has been deleted.`);
            console.log('User deleted with ID:', userIdToDelete);

            setDeleteModalVisible(false);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleViewUsers = async () => {
        const users = await selectAllUsers();
        setAllUsers(users);
        setViewUsersModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>SETTINGS</Text>

            <Image
                source={require("../assets/settingsImage.png")}
                style={styles.settings}
            />

            <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(true)}>
                <Text style={styles.btnText}>CREATE USER INFORMATION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(true)}>
                <Text style={styles.btnText}>UPDATE USER INFORMATION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={() => setDeleteModalVisible(true)}>
                <Text style={styles.btnText}>DELETE USER INFORMATION</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn} onPress={handleViewUsers}>
                <Text style={styles.btnText}>VIEW ALL USERS INFORMATION</Text>
            </TouchableOpacity>

           

            {/* View All Users Modal */}
            <Modal visible={viewUsersModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>All Users</Text>
                        {allUsers && allUsers.length > 0 ? (
                            allUsers.map((user, index) => (
                                <View key={index} style={styles.userItem}>
                                    <Text>User ID: {user.userId}</Text>
                                    <Text>Name: {user.name}</Text>
                                    <Text>Phone: {user.phoneNumber}</Text>
                                    <Text>Email: {user.email}</Text>
                                    <Text>Address: {user.address}</Text>
                                    <Text>Gender: {user.gender}</Text>
                                    <View style={styles.separator} />
                                </View>
                            ))
                        ) : (
                            <Text>No users available.</Text>
                        )}
                        <TouchableOpacity style={styles.btn} onPress={() => setViewUsersModalVisible(false)}>
                            <Text style={styles.btnText}>CLOSE</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Insert User Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>CREATE USER INFORMATION</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="User ID" 
                            value={formData.userId} 
                            keyboardType="numeric"
                            onChangeText={(text) => handleInputChange('userId', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Name" 
                            value={formData.name} 
                            onChangeText={(text) => handleInputChange('name', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Phone Number" 
                            value={formData.phoneNumber} 
                            onChangeText={(text) => handleInputChange('phoneNumber', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Email" 
                            value={formData.email} 
                            onChangeText={(text) => handleInputChange('email', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Address" 
                            value={formData.address} 
                            onChangeText={(text) => handleInputChange('address', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Gender" 
                            value={formData.gender} 
                            onChangeText={(text) => handleInputChange('gender', text)} 
                        />

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={styles.btn} onPress={insertUser}>
                                <Text style={styles.btnText}>SUBMIT</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Update User Modal */}
            <Modal visible={updateModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update User</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter User ID to Update" 
                            value={userIdToUpdate} 
                            keyboardType="numeric"
                            onChangeText={(text) => setUserIdToUpdate(text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Name" 
                            value={formData.name} 
                            onChangeText={(text) => handleInputChange('name', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Phone Number" 
                            value={formData.phoneNumber} 
                            onChangeText={(text) => handleInputChange('phoneNumber', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Email" 
                            value={formData.email} 
                            onChangeText={(text) => handleInputChange('email', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Address" 
                            value={formData.address} 
                            onChangeText={(text) => handleInputChange('address', text)} 
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Gender" 
                            value={formData.gender} 
                            onChangeText={(text) => handleInputChange('gender', text)} 
                        />

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={styles.btn} onPress={updateUser}>
                                <Text style={styles.btnText}>UPDATE</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.btn} onPress={() => setUpdateModalVisible(false)}>
                                <Text style={styles.btnText}>CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Delete User Modal */}
            <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete User Information</Text>

                        <TextInput 
                            style={styles.input} 
                            placeholder="Enter User ID to Delete" 
                            value={userIdToDelete} 
                            keyboardType="numeric"
                            onChangeText={(text) => setUserIdToDelete(text)} 
                        />

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={styles.btn} onPress={deleteUser}>
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
        backgroundColor: '#FD8B51',
    },
    titleText: {
        marginTop: 80,
        marginLeft: -150,
        marginBottom: 100,
        fontSize: 50,
        fontWeight: 'bold',
    },
    settings: {
        width: 140,
        height: 140,
        marginTop: -200,
        marginLeft: 230,
        marginBottom: 50,
    },
    btn: {
        marginBottom: 30,
        width: 300,
        height: 70,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    btnText: {
        color: 'black',
        fontSize: 19,
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
    userItem: {
        marginBottom: 10,
    },
    modalButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
});
