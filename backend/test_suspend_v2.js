const axios = require('axios');
const mongoose = require('mongoose');

// Connect to DB to get a valid teacher and admin token if needed
// Or just creating a temporary admin
const BASE_URL = 'http://localhost:3030/api';

async function testSuspend() {
    try {
        console.log('Test: Direct Suspend via API');
        
        // 1. We need a valid token. 
        // Since we can't easily guess admin password, let's look for an admin in DB directly?
        // Better: We can temporarily allow the route to be public? No, unsafe.
        // Let's create a temp admin via register if possible?
        
        const tempAdmin = {
            name: 'Temp Admin',
            email: `tempadmin_${Date.now()}@test.com`,
            password: 'password123'
        };
        
        console.log('1. Registering temp admin:', tempAdmin.email);
        try {
            const regRes = await axios.post(`${BASE_URL}/auth/register-admin`, tempAdmin); // This route checks for generic admin creation?
            // Actually, usually register-admin might differ. authController.js has registerAdmin
        } catch (e) {
             // If manual register fails, try login with known dev creds if any? 
             // Or maybe just try to login with the temp admin if race condition?
             console.log('Register failed (maybe exists or protected?), trying login...');
        }
        
        // Try login
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: tempAdmin.email,
            password: tempAdmin.password,
            role: 'Admin'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Fetch a teacher
        const teachersRes = await axios.get(`${BASE_URL}/admin/teachers`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        
        if (teachersRes.data.length === 0) {
            console.log('No teachers to suspend.');
            // Add a temp teacher
            console.log('Adding temp teacher...');
            const teacherRes = await axios.post(`${BASE_URL}/admin/teachers`, {
                teacherId: `T${Date.now()}`,
                name: 'Temp Teacher',
                email: `teacher${Date.now()}@test.com`,
                subject: 'Math',
                classConfig: '10A'
            }, { headers: { Authorization: `Bearer ${token}` } });
            teachersRes.data.push(teacherRes.data);
        }
        
        const teacher = teachersRes.data[0];
        const startStatus = teacher.isSuspended || false;
        console.log(`Target Teacher: ${teacher.name}, Is Suspended: ${startStatus}`);
        
        // 3. Toggle
        console.log('3. Toggling Suspend...');
        const toggleRes = await axios.put(`${BASE_URL}/admin/suspend/teacher/${teacher._id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Response:', toggleRes.data);
        
        // 4. Verify
        if (toggleRes.data.isSuspended === !startStatus) {
            console.log('SUCCESS: State toggled correctly.');
        } else {
            console.log('FAILURE: State did not toggle.');
        }

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testSuspend();
