

document.addEventListener("DOMContentLoaded", () => {
    fetch('/admin/drivers/pending')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((drivers) => {
            const driverContainer = document.getElementById('driver-container');
            driverContainer.innerHTML = '';

            drivers.forEach(driver => {
                const driverCard = document.createElement('div');
                driverCard.classList.add('driver-card');

                const aadharPic = document.createElement('img');
                aadharPic.src = driver.aadharCard || '/path/to/default-image.jpg'; 
                aadharPic.alt = `${driver.dName}'s Aadhar Card`;
                aadharPic.classList.add('aadhar-card-pic');
                aadharPic.addEventListener('click', () => openModal(driver.aadharCard));

                const driverInfo = document.createElement('div');
                driverInfo.classList.add('driver-info');
                driverInfo.innerHTML = `
                    <h3>${driver.dName}</h3>
                    <p>Email: ${driver.dEmail}</p>
                    <p>Contact: ${driver.dcontact}</p>
                    <p>License No: ${driver.license}</p>
                    <p>Vehicle No: ${driver.vehicleNo}</p>
                    <p>Car Type: ${driver.carType}</p>


                `;

                const approveButton = document.createElement('button');
                approveButton.classList.add('approve-btn');
                approveButton.textContent = 'Approve';
                approveButton.addEventListener('click', () => updateDriverStatus(driver._id, 'accepted'));

                const rejectButton = document.createElement('button');
                rejectButton.classList.add('reject-btn');
                rejectButton.textContent = 'Reject';
                rejectButton.addEventListener('click', () => updateDriverStatus(driver._id, 'rejected'));

                driverCard.appendChild(aadharPic);
                driverCard.appendChild(driverInfo);
                driverCard.appendChild(approveButton);
                driverCard.appendChild(rejectButton);

                driverContainer.appendChild(driverCard);
            });
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Failed to load driver details. Please try again later.");
        });
});

// Function to open the modal with the clicked image
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('enlargedImage');
    modal.style.display = "block";
    modalImg.src = imageSrc;
}

// Close modal when 'X' is clicked
document.querySelector('.close').onclick = function() {
    document.getElementById('imageModal').style.display = "none";
};

// Close modal when clicked outside the image
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

function updateDriverStatus(driverId, status) {
    fetch(`/admin/drivers/${driverId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(error => {
        console.error("Error updating driver status:", error);
        alert("Failed to update driver status. Please try again later.");
    });
}

