import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import * as SQLite from 'expo-sqlite';

// Initialize database function
const initDB = async () => {
    console.log('initDB');
    try {
        const db = await SQLite.openDatabase('ita213'); // Open the database (no need for openDatabaseAsync)

        await db.exec(`CREATE TABLE IF NOT EXISTS student (studNo INTEGER PRIMARY KEY NOT NULL, FirstName TEXT NOT NULL, LastName TEXT NOT NULL);`);
    } catch (e) {
        console.error("Error: ", e);
    }
};

const insertStudent = async () => {
    console.log('insertStudent');
    try {
        const db = await SQLite.openDatabase('ita213'); // Open the database

        const result = await db.transaction(async (txn) => {
            await txn.executeSql(
                'INSERT INTO student (studNo, FirstName, LastName) VALUES (?, ?, ?)', 1, "MAX", "HAMILTON");
        });

        console.log(result.lastInsertRowId, result.changes);
    } catch (e) {
        console.error("Error: ", e);
    }
};

// Select student function
const selectStudent = async () => {
    console.log('selectStudent');
    try {
        const db = await SQLite.openDatabase('ita213'); // Open the database

        const result = await db.executeSql('SELECT * FROM student');
        
        for (const row of result.rows._array) {
            console.log(row.studNo, row.FirstName, row.LastName);
        }
    } catch (e) {
        console.error("Error: ", e);
    }
};

// Update student function
const updateStudent = async () => {
    console.log('updateStudent');
    try {
        const db = await SQLite.openDatabase('ita213'); // Open the database

        const result = await db.executeSql(
            'UPDATE student SET FirstName = ? WHERE studNo = ?',
            ["Lewis", 1]
        );

        console.log('Student updated', result);
    } catch (e) {
        console.error("Error: ", e);
    }
};

// Delete student function
const deleteStudent = async () => {
    console.log('deleteStudent');
    try {
        const db = await SQLite.openDatabase('ita213'); // Open the database

        const result = await db.executeSql('DELETE FROM student WHERE studNo = ?', [1]);

        console.log('Student deleted', result);
    } catch (e) {
        console.error("Error: ", e);
    }
};

export default function Sample_SQLite() {
    return (    
        <View style={styles.container}>
            <View style={styles.btn}>
                <Button title="INITIALIZE DATABASE" onPress={() => initDB()} />
            </View>

            <View style={styles.btn}>
                <Button title="INSERT STUDENT" onPress={() => insertStudent()} />
            </View>

            <View style={styles.btn}>
                <Button title="SELECT STUDENT" onPress={() => selectStudent()} />
            </View>

            <View style={styles.btn}>
                <Button title="UPDATE STUDENT" onPress={() => updateStudent()} />
            </View>

            <View style={styles.btn}>
                <Button title="DELETE STUDENT" onPress={() => deleteStudent()} />
            </View>
        
