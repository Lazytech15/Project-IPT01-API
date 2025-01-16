const express = require('express'); 
const cors = require('cors'); 
const admin = require('firebase-admin'); 
const dotenv = require('dotenv'); 

// Load environment variables from .env file 
dotenv.config(); 
// Parse the service account key from the environment variable 
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY); 

admin.initializeApp({ credential: admin.credential.cert(serviceAccount), 
databaseURL: "https://attendance-record-1133c-default-rtdb.firebaseio.com" }); 

const app = express(); app.use(cors()); 
app.use(express.json());

// Endpoint to get student data by ID
app.get('/api/students/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        console.log(`Fetching data for student ID: ${studentId}`);
        
        // Get a database reference
        const db = admin.database();
        const studentsRef = db.ref('students');
        
        // Query for the specific student
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
        const db = admin.database();
        const attendanceRef = db.ref('attendance');
        
        const snapshot = await attendanceRef.once('value');
        const attendanceData = snapshot.val();
        
        res.json(attendanceData || {});
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to add attendance record
app.post('/api/attendance', async (req, res) => {
    try {
        const attendanceData = req.body;
        const db = admin.database();
        const attendanceRef = db.ref('attendance');
        
        const newAttendanceRef = attendanceRef.push();
        await newAttendanceRef.set(attendanceData);
        
        res.json({ message: 'Attendance recorded successfully', id: newAttendanceRef.key });
    } catch (error) {
        console.error('Error recording attendance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000; app.listen(PORT, () => { 
    console.log(`Server running on port ${PORT}`); 
});