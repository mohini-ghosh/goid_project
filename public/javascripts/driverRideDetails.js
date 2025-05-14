document.addEventListener("DOMContentLoaded", async () => {
    const rideRequestId = document.getElementById('ride-details').dataset.rideRequestId; // Get rideRequestId
    const response = await fetch(`/driver/ride-status/${rideRequestId}`); // Fetch ride status
    const rideRequest = await response.json();

    const otpModal = document.getElementById('otp-modal');
    const completeRideBtn = document.getElementById('complete-ride-btn');

    // Show OTP modal if ride is accepted and OTP is not verified
    if (rideRequest.status === 'accepted' && !rideRequest.otpVerified) {
        otpModal.style.display = 'block'; // Show OTP modal
    }

    // Fetch and display the destination address
    const destLat = parseFloat(document.getElementById('destinationLat').value);
    const destLng = parseFloat(document.getElementById ('destinationLng').value);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat: destLat, lng: destLng } }, (results, status) => {
        if (status === 'OK') {
            const address = results[0].formatted_address;
            document.getElementById('destination-address').textContent = `Destination: ${address}`;
        } else {
            console.error('Geocode failed: ', status);
        }
    });
    // Complete Ride button functionality
    document.getElementById('complete-ride-btn').addEventListener('click', async () => {
        const response = await fetch(`/driver/complete-ride/${rideRequestId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await response.json();
        if (result.success) {
            alert('Ride completed and email sent to the rider.');
            otpModal.style.display = 'none'; // Hide the OTP modal
            document.getElementById('complete-ride-btn').style.display = 'none'; // Hide the Complete Ride button
        } else {
            alert(result.message || 'Failed to complete the ride.');
        }
    });

    // OTP verification functionality
    document.getElementById('verify-otp').addEventListener('click', async () => {
        const otpInput = document.getElementById('otp-input').value;

        const response = await fetch(`/driver/verify-otp/${rideRequestId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp: otpInput }),
        });

        const result = await response.json();
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = result.message;

        if (result.success) {
            console.log('OTP verified'); // Print message in terminal
            otpModal.style.display = 'none'; // Hide OTP modal
            document.getElementById('complete-ride-btn').style.display = 'block'; // Show Complete Ride button
        } else {
            alert(result.message || 'Invalid OTP. Please try again.');
        }
    });

    // Close modal functionality
    document.getElementById('close-otp-modal').onclick = function() {
        otpModal.style.display = 'none';
    };
});

// Initialize Google Maps
function initMap() {
    const pickupLocation = { lat: parseFloat(document.getElementById('pickupLat').value), lng: parseFloat(document.getElementById('pickupLng').value) };
    const driverLocation = { lat: parseFloat(document.getElementById('driverLat').value), lng: parseFloat(document.getElementById('driverLng').value) };
    const destination = { lat: parseFloat(document.getElementById('destinationLat').value), lng: parseFloat(document.getElementById('destinationLng').value) };

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: pickupLocation,
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Create markers for pickup and driver locations
    new google.maps.Marker({
        position: pickupLocation,
        map,
        title: "Pickup Location",
    });
    new google.maps.Marker({
        position: destination,
        map,
        title: "Office Location",
    });


    new google.maps.Marker({
        position: driverLocation,
        map,
        title: "Driver Location",
    });

    // Request directions
    const request = {
        origin: pickupLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
        } else {
            console.error('Directions request failed due to ' + status);
        }
    });
}

// Call the initMap function when the window loads
window.onload = initMap;