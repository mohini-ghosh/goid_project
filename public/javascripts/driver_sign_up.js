const container = document.getElementById('container');
const overlayCon = document.getElementById('overlayCon');
const overlayBtn = document.getElementById('overlayBtn');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const signInContainer = document.querySelector('.sign-in-container');
const signUpContainer = document.querySelector('.sign-up-container');

const registerForm = document.getElementById('register-form');
const signinForm = document.getElementById('driver-login-form');

const verifyBtn = document.getElementById('verify-btn');
const otpModal = document.getElementById('otp-modal');
const otpModalInput = document.getElementById('otp-modal-input');
const otpModalBtn = document.getElementById('otp-modal-btn');


verifyBtn.disabled = true;
signUpBtn.disabled = true;


verifyBtn.style.display = 'none';
document.getElementById('driver_mail_id').addEventListener('input', () => {
    const email = document.getElementById('driver_mail_id').value;
    verifyBtn.disabled = !email; // Enable or disable the verify button based on email input
    verifyBtn.style.display = email ? 'block' : 'none'; // Show or hide the verify button
});

overlayBtn.addEventListener('click', () => {
  container.classList.toggle('right-panel-active');

  overlayBtn.classList.remove('btnScaled');
  window.requestAnimationFrame(() => {
    overlayBtn.classList.add('btnScaled');
  });
});

signInBtn.addEventListener('click', () => {
  container.classList.remove('right-panel-active');
});

signUpBtn.addEventListener('click', () => {
  container.classList.add('right-panel-active');
});


document.getElementById('driver_mail_id').addEventListener('input', () => {
    const email = document.getElementById('driver_mail_id').value;
    verifyBtn.disabled = !email;
});

verifyBtn.addEventListener('click', async () => {
    
    const email = document.getElementById('driver_mail_id').value;
try{
    const response = await fetch('/driver/send-otp', {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dEmail: email }), 
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
        
        otpModal.style.display = 'block';

    } else {
        alert('Error sending OTP');
    }
    } catch (error) {
        console.error(error);
        alert('Error sending OTP.');
    }
});


        
otpModalBtn.addEventListener('click', async () => {
    const otp = otpModalInput.value;
    const email = document.getElementById('driver_mail_id').value;

    if (!otp) {
        alert('Please fill out all fields.');
        return;
    }

    if ( otp) {
        // Verify the OTP
        try {
            const response = await fetch('/driver/verify-otp', {  
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dEmail: email, otp }), 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }


            const data = await response.json();
            if (data.success) {
                // OTP is verified, enable the sign-up form
                otpModal.style.display = 'none'; // Hide the modal
                registerForm.style.display = 'block'; // Show the sign-up form
                signUpBtn.disabled = false; // Enable the sign-up button
                verifyBtn.style.display = 'none'; // Hide the verify button after successful verification

            } else {
                if (data.message === 'OTP has expired') {
                    alert('OTP has expired. Please request a new OTP.');
                  } else {
                    alert('Invalid OTP. Please try again.');
                  }    
                                            
                }
        } catch (error) {
            console.error(error);
            alert('Error verifying OTP.');
        }
    }
});

// Add event listener to address input field
document.getElementById('driver_address').addEventListener('input', () => {
    const address = document.getElementById('driver_address').value;
    if (address) {
      document.getElementById('get-location-btn').style.display = 'block';
    } else {
      document.getElementById('get-location-btn').style.display = 'none';
    }
  });
  
 
// Add event listener to Get Location button
document.getElementById('get-location-btn').addEventListener('click', () => {
    const address = document.getElementById('driver_address').value;
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyDu3n8SgW9peGPFRl5Qe7fYvGdeuk8xzrI`;
    fetch(geocodingUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                const lat = data.results[0].geometry.location.lat;
                const lng = data.results[0].geometry.location.lng;
                document.getElementById('latitude').value = lat;
                document.getElementById('longitude').value = lng;
                console.log(`Latitude: ${lat}, Longitude: ${lng}`);
                document.getElementById('get-location-btn').style.display = 'none'; // Hide the Get Location button

            } else {
                alert('Location not found');
            }
        })
        .catch(error => {
            console.error(error);
            alert('Error fetching location');
        });
});

// Toggle password visibility
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput .getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye-slash'); // Toggle the eye slash icon
});

const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
const confirmPasswordInput = document.getElementById('confirm_password');

toggleConfirmPassword.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    toggleConfirmPassword.classList.toggle('fa-eye-slash'); // Toggle the eye slash icon
});

let isSubmitting = false;

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
   
    if (isSubmitting) return;
     
    isSubmitting = true;

    const dName = document.getElementById('driver_name').value;
    const dEmail = document.getElementById('driver_mail_id').value;
    const dcontact = document.getElementById('driver_contact').value;
    const license = document.getElementById('license_no').value;
    const dAddress = document.getElementById('driver_address').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const carType = document.getElementById('carType').value; 
    const vehicleNo = document.getElementById('vehicle_no').value;
    const profilePic = document.getElementById('profile_pic').files[0];
    const aadharCard = document.getElementById('aadhar_card').files[0];
       
    if (!dName || !dEmail || !dcontact || !license || !dAddress || !password || !confirmPassword || !carType || !vehicleNo || !aadharCard) {
        alert('Please fill out all fields.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(dEmail)) {
        alert('Invalid email format.');
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        alert('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
    }

    
    const licenseRegex = /^[A-Z]{2}[0-9]{2}\s?[0-9]{4}\s?[0-9]{7}$/;
    if (!licenseRegex.test(license)) {
        alert('Invalid License format');
        return;
    }


    const vehicleRegex = /^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}$/;
    if (!vehicleRegex.test(vehicleNo)) {
        alert('Invalid Vehicle No format');
        return;
    }


    const formData = new FormData();
    formData.append('dName', dName);
    formData.append('dEmail', dEmail);
    formData.append('dcontact', dcontact);
    formData.append('license', license);
    formData.append('dAddress', dAddress);
    formData.append('password', password);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('carType', carType);
    formData.append('vehicleNo', vehicleNo);
    formData.append('profile_pic', profilePic);
    formData.append('aadharCard', aadharCard);


    fetch('/driver/register', {  // Ensure this is the correct backend URL
        method: 'POST',
        body: formData,

    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.message);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log(data.message);
        
            if (data.message === "Driver Details Has Been Sent to Admin Successfully") {
                console.log(data.message);
                alert(data.message);
                window.location.href = '/drive';
            } else {
                alert(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(error.message);
            clearFormFields();
        })
        .finally(() => {
            isSubmitting = false; 
        });
});

// Function to clear form fields
function clearFormFields() {
    document.getElementById('driver_name').value = '';
    document.getElementById('driver_mail_id').value = '';
    document.getElementById('driver_contact').value = '';
    document.getElementById('license_no').value = '';
    document.getElementById('driver_address').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirm_password').value = '';
    document.getElementById('vehicle_no').value = '';

}


// Toggle password visibility
const togglePasswordLog = document.getElementById('toggle-password-log');
const passwordInputLog = document.getElementById('driver-pass');

togglePasswordLog.addEventListener('click', () => {
    const type = passwordInputLog.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInputLog.setAttribute('type', type);
    togglePasswordLog.classList.toggle('fa-eye-slash'); // Toggle the eye slash icon
});


// Login Form handling
signinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const dEmail = document.getElementById('driver-email').value;
    const password = document.getElementById('driver-pass').value;

    if (!dEmail || !password) {
        alert('Please fill out all fields.');
        return;
    }

    fetch('/driver/login', {  // Ensure this is the correct backend URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dEmail, password }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.message === "Login successful") {
                alert('Login successful');
                window.location.href = '/drive'; // Redirect on login success
            } else {
                alert(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error during login.');
        });
});