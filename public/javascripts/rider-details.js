

document.addEventListener("DOMContentLoaded", () => {
    fetch('/admin/riders/pending')
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((riders) => {
            const riderContainer = document.getElementById('rider-container');
            riderContainer.innerHTML = '';

            riders.forEach(rider => {
                const riderCard = document.createElement('div');
                riderCard.classList.add('rider-card');

                const IDPic = document.createElement('img');
                IDPic.src = rider.IDCard || '/path/to/default-image.jpg'; 
                IDPic.alt = `${rider.eName}'s ID Card`;
                IDPic.classList.add('Id-card-pic');
                IDPic.addEventListener('click', () => openModal(rider.IDCard));

                const riderInfo = document.createElement('div');
                riderInfo.classList.add('rider-info');
                riderInfo.innerHTML = `
                    <h3>${rider.eName}</h3>
                    <p>Email: ${rider.eEmail}</p>
                    <p>Contact: ${rider.contact}</p>
                    <p>Employee Id: ${rider.eId}</p>
                `;

                const approveButton = document.createElement('button');
                approveButton.classList.add('approve-btn');
                approveButton.textContent = 'Approve';
                approveButton.addEventListener('click', () => updateRiderStatus(rider._id, 'accepted'));

                const rejectButton = document.createElement('button');
                rejectButton.classList.add('reject-btn');
                rejectButton.textContent = 'Reject';
                rejectButton.addEventListener('click', () => updateRiderStatus(rider._id, 'rejected'));

                riderCard.appendChild(IDPic);
                riderCard.appendChild(riderInfo);
                riderCard.appendChild(approveButton);
                riderCard.appendChild(rejectButton);

                riderContainer.appendChild(riderCard);
            });
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Failed to load rider details. Please try again later.");
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

function updateRiderStatus(riderId, status) {
    fetch(`/admin/riders/${riderId}/status`, {
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
        console.error("Error updating rider status:", error);
        alert("Failed to update rider status. Please try again later.");
    });
}

