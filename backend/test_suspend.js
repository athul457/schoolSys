const axios = require('axios');

// Assuming server running on 5000
const BASE_URL = 'http://localhost:5000/api';

async function testSuspend() {
    try {
        console.log('1. Login as Admin...');
        // We need an admin login to get token. Hardcoding credentials or assuming we can find one.
        // If we can't login, we can't test.
        // Let's assume there is a seed admin or we can just try to hit the endpoint if we disable auth for a second?
        // No, let's try to login.
        
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@example.com', // Replace with valid admin
            password: 'adminpassword',   // Replace with valid password
            role: 'Admin'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');
        
        // 2. Get Teachers
        console.log('2. Fetching Teachers...');
        const teachersRes = await axios.get(`${BASE_URL}/admin/teachers`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const teachers = teachersRes.data;
        if (teachers.length === 0) {
            console.log('No teachers found. Cannot test suspend.');
            return;
        }
        
        const targetTeacher = teachers[0];
        console.log(`Target Teacher: ${targetTeacher.name} (ID: ${targetTeacher._id}, Suspended: ${targetTeacher.isSuspended})`);
        
        // 3. Toggle Suspend
        const newStatus = !targetTeacher.isSuspended;
        console.log(`3. Attempting to set suspended to: ${newStatus}`);
        
        const suspendRes = await axios.put(`${BASE_URL}/admin/suspend/teacher/${targetTeacher._id}`, 
            { isSuspended: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Suspend response:', suspendRes.data);
        
        // 4. Verify
        const verifyRes = await axios.get(`${BASE_URL}/admin/teachers`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const verifiedTeacher = verifyRes.data.find(t => t._id === targetTeacher._id);
        console.log(`4. Verification: Teacher isSuspended is now: ${verifiedTeacher.isSuspended}`);
        
        if (verifiedTeacher.isSuspended === newStatus) {
            console.log('SUCCESS: Backend suspension logic works.');
        } else {
            console.log('FAILURE: Backend suspension logic failed.');
        }
        
    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testSuspend();
