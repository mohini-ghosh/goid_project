const rideDetailsBtn = document.getElementById('ride-details-btn');
const riderDetailsBtn = document.getElementById('rider-details-btn');
const driverDetailsBtn = document.getElementById('driver-details-btn');

rideDetailsBtn.addEventListener('click', () => {
    // Redirect to ride details page
    window.location.href = '/ride1';
});

riderDetailsBtn.addEventListener('click', () => {
    // Redirect to rider details page
    window.location.href = '/rider1';
});

driverDetailsBtn.addEventListener('click', () => {
    // Redirect to driver details page
    window.location.href = '/driver1';
});