const loginForm = document.getElementById('ad-login-form');

// Toggle password visibility
const togglePasswordLog = document.getElementById('toggle-password-log');
const passwordInputLog = document.getElementById('password');

togglePasswordLog.addEventListener('click', () => {
    const type = passwordInputLog.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInputLog.setAttribute('type', type);
    togglePasswordLog.classList.toggle('fa-eye-slash'); // Toggle the eye slash icon
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const adminMail = document.getElementById('admin-mail').value;
    const adminPass = document.getElementById('admin-password').value;

    if (adminMail === '' || adminPass === '') {
        alert('Please fill out all fields.');
        return;
    }

    fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            adminMail,
            adminPass,
        }),
    })

    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();  // Parse JSON response
    })
    .then((data) => {
        if (data.message === "Login successful") {
            console.log("Logged in successfully.");
            alert('Login successful');
            window.location.href = '/admin_home'; 

            // Optionally redirect to another page or show a success message
        } else {
            console.log(data.message);
            alert(data.message);

        }
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl; // Redirect to the provided URL
        }               
    })
    .catch((error) =>{
            console.error('Error:', error);
            alert('Error during login.');
    
    });
});