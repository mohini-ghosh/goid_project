document.addEventListener("DOMContentLoaded", function() {
    // Read More functionality
    const readMoreLinks = document.querySelectorAll('.read-more-link');
    readMoreLinks.forEach(readMoreLink => {
        const moreText = readMoreLink.previousElementSibling;

        readMoreLink.addEventListener('click', function(e) {
            e.preventDefault();

            if (moreText.style.display === "none") {
                moreText.style.display = "inline";
                readMoreLink.textContent = "Read less";
            } else {
                moreText.style.display = "none";
                readMoreLink.textContent = "Read more";
            }
        });
    });
});