// Simple test script to check the login functionality
async function testLogin() {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'admin',
        password: 'adminpassword',
      }),
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('Login successful!');
      // Now check if we can access the protected route
      const userResponse = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      const userData = await userResponse.json();
      console.log('User data:', userData);
    } else {
      console.log('Login failed!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Admin login test
async function testAdminLogin() {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'admin',
        password: 'adminpassword',
      }),
    });
    
    const data = await response.json();
    console.log('Admin Response status:', response.status);
    console.log('Admin Response data:', data);
    
    if (response.ok) {
      console.log('Admin login successful!');
      // Now check if we can access the protected admin route
      const adminResponse = await fetch('/api/admin/user', {
        credentials: 'include',
      });
      const adminData = await adminResponse.json();
      console.log('Admin user data:', adminData);
    } else {
      console.log('Admin login failed!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Execute the tests
console.log('Testing regular login:');
testLogin().then(() => {
  console.log('\nTesting admin login:');
  testAdminLogin();
});