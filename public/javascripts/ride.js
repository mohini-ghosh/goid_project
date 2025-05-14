
let map;
let directionsService;
let directionsRenderer;
let homeLocation; // Declare homeLocation globally

window.initMap = function () {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 22.572790590435996, lng: 88.43741479531052 },
        zoom: 14
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Fetch the rider's home location
    fetch('/rideOpt/get-home-location')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Check if homeLocation exists in the response
            if (data && data.homeLocation) {
                homeLocation = { lat: data.homeLocation.latitude, lng: data.homeLocation.longitude };
            } else {
                throw new Error('Home location data is missing');
            }
        })
        .catch(error => console.error('Error fetching home location:', error));
}

function updateMap(rideType) {
    const officeLocation = { lat: 22.572790590435996, lng: 88.43741479531052 }; 

    if (!homeLocation) {
        console.error('Home location is not defined');
        return; // Exit if homeLocation is not defined
    }

    if (rideType === 'hometooffice') {
        calculateAndDisplayRoute(homeLocation, officeLocation);
    } else if (rideType === 'officetohome') {
        calculateAndDisplayRoute(officeLocation, homeLocation);
    } else if (rideType === 'both') {
        calculateAndDisplayRoute(homeLocation, officeLocation);
        calculateAndDisplayRoute(officeLocation, homeLocation);
    } else {
        directionsRenderer.setDirections({ routes: [] });
    }
}

function calculateAndDisplayRoute(start, end) {
    directionsService.route({
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    },
    (response, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else if (status === 'ZERO_RESULTS') {
            window.alert('No route found between the origin and destination.');
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

document.getElementById('hometooffice').addEventListener('click', () => updateMap('hometooffice'));
document.getElementById('officetohome').addEventListener('click', () => updateMap('officetohome'));
document.getElementById('both').addEventListener('click', () => updateMap('both'));


// Define the modal and button elements
const scheduleBtn = document.getElementById('schedule');
const scheduleModal = document.getElementById('scheduleModal');
const closeModal = scheduleModal.querySelector('.close'); // Close button inside the modal

// Show the modal when the Schedule Later button is clicked
scheduleBtn.addEventListener('click', () => {
    scheduleModal.style.display = 'flex';
});

// Close the modal when the close button is clicked
closeModal.onclick = function() {
    scheduleModal.style.display = 'none';
}

// Close the modal when clicking outside of the modal
window.onclick = function(event) {
    if (event.target === scheduleModal) {
        scheduleModal.style.display = 'none';
    }
}

// Handle the schedule form submission
document.getElementById('scheduleForm').addEventListener('submit', async(e) => {
    e.preventDefault();
    const carType = document.getElementById('carType').value;
    const scheduleTime = document.getElementById('scheduleTime').value;

    // Get the current date
    const currentDate = new Date();
    const [hours, minutes] = scheduleTime.split(':'); // Split the time into hours and minutes

    // Create a new Date object for the scheduled time
    const scheduledDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours, minutes);
    // Send the schedule request to the server
    try {
        const response = await fetch('/rideOpt/schedule-ride', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                carType,
                scheduleTime:scheduledDate.toISOString(), // Convert to ISO string
            }),
        });

        const data = await response.json();
        if (data.success) {
            alert(data.message);
            scheduleModal.style.display = 'none'; // Close the modal
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error scheduling ride:', error);
        alert('Error scheduling ride. Please try again.');
    }
});



window.onload = initMap;