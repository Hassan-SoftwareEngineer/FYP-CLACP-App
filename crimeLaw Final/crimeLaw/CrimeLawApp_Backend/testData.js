const axios = require('axios');

// Dummy data to send to the server
const dummyData = {
  name: 'John Doe',
  email: 'john@example.com',
  mobile: '1234567890',
  cnic: '1234567890123',
  type: 'citizen',
  password: 'password123'
};

axios.post('http://localhost:5001/register', dummyData)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Error:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an error
      console.error('Error:', error.message);
    }
  });
