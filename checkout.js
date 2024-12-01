document.addEventListener('DOMContentLoaded', function() {
    const checkoutHistoryBody = document.getElementById('checkoutHistoryBody');
    const dateFilter = document.getElementById('dateFilter');
    const nameFilter = document.getElementById('nameFilter');

    // Function to render checkout history
    function renderCheckoutHistory(history) {
        // Clear existing rows
        checkoutHistoryBody.innerHTML = '';

        // If no history, show a message
        if (!history || history.length === 0) {
            const noHistoryRow = document.createElement('tr');
            noHistoryRow.innerHTML = `
                <td colspan="7" class="no-history">
                    No checkout history found.
                </td>
            `;
            checkoutHistoryBody.appendChild(noHistoryRow);
            return;
        }

        // Render checkout history rows
        history.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.name}</td>
                <td>${entry.date}</td>
                <td>${entry.timeIn}</td>
                <td>${entry.timeOut}</td>
                <td>${entry.pax}</td>
                <td>${entry.contact}</td>
                <td>${entry.tableNumber}</td>
            `;
            checkoutHistoryBody.appendChild(row);
        });
    }

    // Load checkout history from localStorage
    function loadCheckoutHistory() {
        const checkoutHistory = JSON.parse(localStorage.getItem('checkoutHistory')) || [];
        return checkoutHistory;
    }

    // Initial render
    let checkoutHistory = loadCheckoutHistory();
    renderCheckoutHistory(checkoutHistory);

    // Date filter
    dateFilter.addEventListener('change', function() {
        const filteredHistory = checkoutHistory.filter(entry => 
            !this.value || entry.date === this.value
        );
        renderCheckoutHistory(filteredHistory);
    });

    // Name filter
    nameFilter.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredHistory = checkoutHistory.filter(entry => 
            entry.name.toLowerCase().includes(searchTerm)
        );
        renderCheckoutHistory(filteredHistory);
    });

    // Reset filters function
    window.resetFilters = function() {
        dateFilter.value = '';
        nameFilter.value = '';
        renderCheckoutHistory(checkoutHistory);
    };
});

document.addEventListener('DOMContentLoaded', function() {
    const checkoutHistoryBody = document.getElementById('checkoutHistoryBody');
    const dateFilter = document.getElementById('dateFilter');
    const nameFilter = document.getElementById('nameFilter');

    // Function to render checkout history
    function renderCheckoutHistory(history) {
        // Clear existing rows
        checkoutHistoryBody.innerHTML = '';

        // If no history, show a message
        if (!history || history.length === 0) {
            const noHistoryRow = document.createElement('tr');
            noHistoryRow.innerHTML = `
                <td colspan="7" class="no-history">
                    No checkout history found.
                </td>
            `;
            checkoutHistoryBody.appendChild(noHistoryRow);
            return;
        }

        // Render checkout history rows
        history.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.name}</td>
                <td>${entry.date}</td>
                <td>${entry.timeIn}</td>
                <td>${entry.timeOut}</td>
                <td>${entry.pax}</td>
                <td>${entry.contact}</td>
                <td>${entry.tableNumber}</td>
            `;
            checkoutHistoryBody.appendChild(row);
        });
    }

    // Load checkout history from localStorage
    function loadCheckoutHistory() {
        const checkoutHistory = JSON.parse(localStorage.getItem('checkoutHistory')) || [];
        return checkoutHistory;
    }

    // Print checkout history to text file
    window.printCheckoutHistory = function() {
        const checkoutHistory = loadCheckoutHistory();
        
        // If no history, alert the user
        if (!checkoutHistory || checkoutHistory.length === 0) {
            alert('No checkout history to print.');
            return;
        }

        // Create text content for the file
        let fileContent = "Checkout History\n\n";
        fileContent += "Name\tDate\tTime In\tTime Out\tGuests\tContact\tTable Number\n";
        fileContent += "--------------------------------------------------------------------\n";

        checkoutHistory.forEach(entry => {
            fileContent += `${entry.name}\t${entry.date}\t${entry.timeIn}\t${entry.timeOut}\t${entry.pax}\t${entry.contact}\t${entry.tableNumber}\n`;
        });

        // Create a Blob with the file content
        const blob = new Blob([fileContent], { type: 'text/plain' });
        
        // Create a link element to trigger download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `checkout_history_${new Date().toISOString().split('T')[0]}.txt`;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Initial render
    let checkoutHistory = loadCheckoutHistory();
    renderCheckoutHistory(checkoutHistory);

    // Date filter
    dateFilter.addEventListener('change', function() {
        const filteredHistory = checkoutHistory.filter(entry => 
            !this.value || entry.date === this.value
        );
        renderCheckoutHistory(filteredHistory);
    });

    // Name filter
    nameFilter.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredHistory = checkoutHistory.filter(entry => 
            entry.name.toLowerCase().includes(searchTerm)
        );
        renderCheckoutHistory(filteredHistory);
    });

    // Reset filters function
    window.resetFilters = function() {
        dateFilter.value = '';
        nameFilter.value = '';
        renderCheckoutHistory(checkoutHistory);
    };
});