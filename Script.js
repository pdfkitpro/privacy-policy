document.addEventListener('DOMContentLoaded', () => {
    // Select all the tool cards
    const toolCards = document.querySelectorAll('.tool-card');

    // Add a click event listener to each card
    toolCards.forEach(card => {
        card.addEventListener('click', (event) => {
            // Prevent the default link behavior
            event.preventDefault(); 
            
            // Get the tool name from the h3 element inside the card
            const toolName = card.querySelector('h3').innerText;

            // Show a friendly alert to the user
            alert(`You clicked on "${toolName}". This is a front-end demonstration. The actual PDF processing functionality would require a server-side backend.`);
        });
    });

    // Also add an alert for the main "Select PDF" button
    const mainCtaButton = document.querySelector('.main-cta .btn-primary');
    if(mainCtaButton) {
        mainCtaButton.addEventListener('click', () => {
            alert('This is a front-end demonstration. File selection and upload would be handled by a backend server.');
        });
    }
});