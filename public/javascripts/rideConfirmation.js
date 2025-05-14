
function initMap() {
    const pickupLocation = {
        lat: parseFloat(document.getElementById("pickupLat").value),
        lng: parseFloat(document.getElementById("pickupLng").value)
    };
    const driverLocation = {
        lat: parseFloat(document.getElementById("driverLat").value),
        lng: parseFloat(document.getElementById("driverLng").value)
    };
    const destination = {
        lat: 22.572790590435996,
        lng: 88.43741479531052
    };

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: pickupLocation,
    });

    const driverMarker = new google.maps.Marker({
        position: driverLocation,
        map,
        title: "Driver Location",
        icon: {
            url: '/images/car.webp',  // Path to your custom car icon image
            scaledSize: new google.maps.Size(40, 40), // Adjust the size if needed
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 20) // Set the anchor point for the car icon
        }
    });

    const pickupMarker = new google.maps.Marker({
        position: pickupLocation,
        map,
        title: "Pickup Location",
    });

    const destinationMarker = new google.maps.Marker({
        position: destination,
        map,
        title: "Destination",
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsDisplay = new google.maps.DirectionsRenderer({ map });

    const routeRequest = {
        origin: driverLocation,
        destination: pickupLocation,
        travelMode: "DRIVING",
    };

    directionsService.route(routeRequest, (result, status) => {
        if (status === "OK") {
            directionsDisplay.setDirections(result);
            animateDriverAlongPath(result.routes[0].overview_path);
        } else {
            console.error("Directions request failed due to " + status);
        }
    });

    function animateDriverAlongPath(path) {
        let stepIndex = 0;
        const animationInterval = 100; 

        const intervalId = setInterval(() => {
            if (stepIndex < path.length) {
                driverMarker.setPosition(path[stepIndex]);
                stepIndex++;
            } else {
                clearInterval(intervalId);
                const rideRequestId = document.getElementById('rideRequestId').value;

                fetch('/driver/driver-arrived', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ riderEmail: document.getElementById('riderEmail').value ,rideRequestId})
                })
                .then(response => response.json())
                .then(data => console.log(data.message))
                .catch(error => console.error('Error sending arrival notification:', error));
            }
        }, animationInterval);
    }
}

window.initMap = initMap;
