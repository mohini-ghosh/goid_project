
document.addEventListener("DOMContentLoaded", function() {
  const cancelButtons = document.querySelectorAll(".cancel-btn");
  const rateButtons = document.querySelectorAll(".rate-btn");
    const ratingModal = document.getElementById("ratingModal");
    const stars = document.querySelectorAll(".star");
    const submitRatingButton = document.getElementById("submitRating");
    const closeModalButton = document.getElementById("closeModal");
    let currentRideId;
    let selectedRating = 0;

  cancelButtons.forEach(button => {
    button.addEventListener("click", async function() {
      const bookingId = this.dataset.id; // Get the booking ID from the button's data attribute
      try {
        const response = await fetch('/rideOpt/cancel-ride', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rideRequestId: bookingId }), // Send the booking ID in the request body
        });

        const result = await response.json();

        if (result.success) {
          alert("Booking cancelled successfully.");
          window.location.reload(); // Reload the page to update the bookings list
        } else {
          alert("Failed to cancel booking. Please try again.");
        }
      } catch (error) {
        console.error("Error cancelling booking:", error);
      }
    });
  });
// Add event listener to each rate button to open the modal and set the currentRideId
rateButtons.forEach(button => {
  button.addEventListener("click", function() {
    currentRideId = this.dataset.id; // Set the current ride ID for rating
    ratingModal.style.display = "block"; // Show the modal
  });
});

// Close modal functionality
closeModalButton.addEventListener("click", function() {
  ratingModal.style.display = "none"; // Hide the modal
});



// Star selection
stars.forEach(star => {
  star.addEventListener("click", function() {
      selectedRating = parseInt(this.dataset.value); // Get the selected star value
      updateStarRating(selectedRating); // Highlight selected stars
  });
});

// Update the UI to show selected stars
function updateStarRating(rating) {
  stars.forEach(star => {
      star.classList.remove("selected");
      if (parseInt(star.dataset.value) <= rating) {
          star.classList.add("selected");
      }
  });
}
submitRatingButton.addEventListener("click", async function() {
  if (selectedRating === 0) {
      alert("Please select a rating.");
      return;
  }

  try {
      const response = await fetch('/driver/rate-ride', {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ rideRequestId: currentRideId, rating: selectedRating }),
      });

      const result = await response.json();
      if (result.success) {
          alert("Thank you for your rating!");
          
          // Hide the rating button and show "Thank you"
          const rateButton = document.querySelector(`.rate-btn[data-id="${currentRideId}"]`);
          if (rateButton) {
              rateButton.parentElement.innerHTML = "<span>Thank you!</span>"; // Replace button with "Thank you!"
          }

          // Close the modal
          ratingModal.style.display = "none"; // Hide the modal

      } else {
          alert("Failed to submit rating. Please try again.");
      }
  } catch (error) {
      console.error("Error submitting rating:", error);
  }
});
});

document.addEventListener('DOMContentLoaded', () => {
  const confirmationButtons = document.querySelectorAll('.confirmation-btn');

  confirmationButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const rideRequestId = button.dataset.id;
      window.location.href = `/rideOpt/ride-confirmation/${rideRequestId}`;
    });
  });
});