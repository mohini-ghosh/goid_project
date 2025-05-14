// Function to fetch the destination address using Google Maps Geocoding API
async function fetchDestinationAddress(lat, lng, requestId) {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(lat, lng);
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
            document.getElementById(`destination-${requestId}`).textContent = results[0].formatted_address;
        } else {
            console.error('Geocode failed: ', status);
        }
    });
}

// Function to load destination addresses for all ride requests
async function loadDestinationAddresses(rideRequests) {
    rideRequests.forEach(request => {
        const lat = request.destination.coordinates[1];
        const lng = request.destination.coordinates[0];
        const requestId = request._id;
        fetchDestinationAddress(lat, lng, requestId);
    });
}

// Function to accept a ride request
async function acceptRequest(requestId) {
    const response = await fetch(`/driver/accept-ride/${requestId}`, { method: 'POST' });
    const result = await response.json();
    alert(result.message);
    location.reload(); // Reload the page to show updated requests
}

// Function to cancel a ride request
async function cancelRequest(requestId) {
    const response = await fetch(`/driver/cancel-ride/${requestId}`, { method: 'POST' });
    const result = await response.json();
    alert(result.message);
    location.reload(); // Reload the page to show updated requests
}

// Function to view ride details
async function viewRideDetails(requestId) {
    window.location.href = `/driver/ride-details/${requestId}`; // Redirect to the ride details page
}

// Load destination addresses when the page is fully loaded
window.onload = () => {
    const rideRequests = JSON.parse(document.getElementById('ride-requests-data').textContent); // Assuming you have a script tag with ride requests data
    loadDestinationAddresses(rideRequests);
};