
// Login------>
const loginForm = document.getElementById('login-form');

// Toggle password visibility
const togglePasswordLog = document.getElementById('toggle-password-log');
const passwordInputLog = document.getElementById('password-log');

togglePasswordLog.addEventListener('click', () => {
    const type = passwordInputLog.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInputLog.setAttribute('type', type);
    togglePasswordLog.classList.toggle('fa-eye-slash'); // Toggle the eye slash icon
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const eId = document.getElementById('employee-id').value;
    const password = document.getElementById('password-log').value;

    if (eId === '' || password === '') {
        alert('Please fill out all fields.');
        return;
    }

    fetch('/rider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            eId,
            password,
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
            alert("Login successful");
            window.location.href = '/home';
        } else {
            console.log(data.message);
        }
    })
    .catch((error) => console.error('Error:', error));
    });