
function selectLoginType(type) {
    var loginBtn = document.getElementById("loginBtn");
    loginBtn.innerHTML = `Login (${type}) 
        <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16.5l6-6h-12l6 6z" fill="currentColor"></path>
        </svg>`;
    // The login button will change to show the selected type
    // You can also add any specific action here (like setting the role to Rider/Admin)
}

