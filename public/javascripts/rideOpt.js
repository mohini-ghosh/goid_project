let riderId;
let selectedOption = null;

// Get the ride options container
const rideOptionsContainer = document.querySelector('.ride-options-container');

// Add event listener for clicking on ride options
rideOptionsContainer.addEventListener('click', (event) => {
  const target = event.target.closest('.ride-option');

  // Check if the clicked element is a ride option
  if (target) {
    // Remove highlight from previously selected option
    if (selectedOption) {
      selectedOption.classList.remove('selected');
    }

    // Highlight the selected option
    target.classList.add('selected');
    selectedOption = target; // Store the currently selected option
  }
});

// Add event listener for the Book Now button
document.getElementById("search-ride").addEventListener("click", async () => {
  if (!selectedOption) {
    alert("Please select a ride option before booking.");
    return;
  }

  const carType = selectedOption.dataset.carType;

  try {
    const response = await fetch('/rideOpt/get-rider-data');
    const data = await response.json();
    riderId = data.riderId;
    const pickupLocation = data.homeLocation;
    const pickupAddress = data.pickupAddress;
    const eId = data.eId;

    const bookingResponse = await fetch('/rideOpt/search-ride', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        riderId,
        carType,
        pickupLocation,
        eId,
        pickupAddress,
      }),
    });

    const rideRequest = await bookingResponse.json();
    console.log(rideRequest);

    if (rideRequest.message === "Ride request created successfully, awaiting driver acceptance.") {
      alert("Your ride request has been created successfully. Please wait for a driver to accept your request.");
      document.getElementById("cancel-ride").style.display = "block"; // Show cancel button
      document.getElementById("view-confirmation").style.display = "block"; // Show confirmation button
    } else {
      alert(rideRequest.message);
    }

  } catch (error) {
    console.error(error);
  }
});

// Add event listener for the Cancel Ride button
document.getElementById("cancel-ride").addEventListener("click", async () => {
  try {
    const cancelResponse = await fetch('/rideOpt/cancel-ride', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rideRequestId: sessionStorage.getItem('rideRequestId'),
      }),
    });

    const cancelResult = await cancelResponse.json();

    if (cancelResult.success) {
      alert("Your ride has been cancelled successfully.");
      document.getElementById("cancel-ride").style.display = "none";
      document.getElementById("map").style.display = "none";
      document.getElementById("view-confirmation").style.display = "none";
    } else {
      alert("Failed to cancel the ride. Please try again.");
    }
  } catch (error) {
    console.error("Error cancelling ride:", error);
  }
});

// Add event listener for the View Confirmation button
document.getElementById("view-confirmation").addEventListener("click", () => {
  const rideRequestId = sessionStorage.getItem('rideRequestId');
  window.location.href = `/rideOpt/view-confirmation/${rideRequestId}`; // Redirect to ride details page
});