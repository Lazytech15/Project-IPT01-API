// Import necessary modules
const express = require('express'); 
const cors = require('cors'); 
const admin = require('firebase-admin'); 
const dotenv = require('dotenv'); 

// Load environment variables from .env file
dotenv.config(); 

// Parse the service account key from the environment variable
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY); 

// Initialize Firebase Admin SDK with service account credentials and database URL
admin.initializeApp({ 
    credential: admin.credential.cert(serviceAccount), 
    databaseURL: "https://attendance-record-1133c-default-rtdb.firebaseio.com" 
}); 

// Create an Express app
const app = express(); 

// Use CORS middleware to allow cross-origin requests
app.use(cors()); 

// Use JSON middleware to parse JSON request bodies
app.use(express.json());

// Endpoint to get student data by ID
app.get('/api/students/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        console.log(`Fetching data for student ID: ${studentId}`);
        
        // Get a reference to the Firebase Realtime Database
        const db = admin.database();
        const studentsRef = db.ref('students');
        
        // Query for the specific student by ID
        const snapshot = await studentsRef.child(studentId).once('value');
        const studentData = snapshot.val();

        if (!studentData) {
            console.log('Student not found');
            return res.status(404).json({ error: 'Student not found' });
        }

        // Return the student data
        console.log('Student data retrieved:', studentData);
        res.json(studentData);
    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get all attendance records
app.get('/api/attendance', async (req, res) => {
    try {
        // Get a reference to the attendance records in the database
        const db = admin.database();
        const attendanceRef = db.ref('attendance');
        
        // Retrieve all attendance records
        const snapshot = await attendanceRef.once('value');
        const attendanceData = snapshot.val();
        
        // Return the attendance data
        res.json(attendanceData || {});
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to add a new attendance record
app.post('/api/attendance', async (req, res) => {
    try {
        const attendanceData = req.body;
        
        // Get a reference to the attendance records in the database
        const db = admin.database();
        const attendanceRef = db.ref('attendance');
        
        // Add the new attendance record to the database
        const newAttendanceRef = attendanceRef.push();
        await newAttendanceRef.set(attendanceData);
        
        // Return a success message with the new record's ID
        res.json({ message: 'Attendance recorded successfully', id: newAttendanceRef.key });
    } catch (error) {
        console.error('Error recording attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server and listen on the specified port
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => { 
    console.log(`Server running on port ${PORT}`); 
});
