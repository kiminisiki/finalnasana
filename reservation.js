document.addEventListener('DOMContentLoaded', function () {
    let isEditing = false; // Flag to track edit mode
    let editingRow = null; // Stores the row being edited

    // Initialize date in header
    const dateHeader = document.getElementById('current-date');
    const currentDate = new Date();
    const options = { month: 'long', day: '2-digit', year: 'numeric' };

    const urlParams = new URLSearchParams(window.location.search);
    const selectedDate = urlParams.get('date') || sessionStorage.getItem('selectedDate');

    if (selectedDate) {
        const parsedDate = new Date(selectedDate);
        dateHeader.textContent = parsedDate.toLocaleDateString('en-US', options);
        sessionStorage.setItem('selectedDate', selectedDate);
    } else {
        dateHeader.textContent = currentDate.toLocaleDateString('en-US', options);
    }

    // Initialize cashier grid
    const cashierGrid = document.getElementById('cashierGrid');
    const totalCells = 15;

    // Default table availability
    const defaultTableAvailability = {
        '9:00 AM - 12:00 PM': Array(totalCells).fill(true),
        '1:00 PM - 3:00 PM': Array(totalCells).fill(true),
        '4:00 PM - 7:00 PM': Array(totalCells).fill(true),
    };

    // Load saved table availability from localStorage or use defaults
    let tableAvailability = JSON.parse(localStorage.getItem('tableAvailability')) || defaultTableAvailability;

    // Save table availability to localStorage
    function saveTableAvailability() {
        localStorage.setItem('tableAvailability', JSON.stringify(tableAvailability));
    }

    // Initialize time slot dropdown
    const timeSlotDropdown = document.getElementById('timeSlot');

    // Function to update the cashier grid based on time slot
    function updateCashierGrid(timeSlot) {
        cashierGrid.innerHTML = ''; // Clear existing grid

        tableAvailability[timeSlot].forEach((isAvailable, index) => {
            const cell = document.createElement('div');
            cell.className = `cashier-cell ${isAvailable ? 'cashier-available' : 'cashier-unavailable'}`;
            cell.innerHTML = `Table ${index + 1}`;
            cell.dataset.tableNumber = index + 1;

            if (isAvailable) {
                cell.addEventListener('click', function () {
                    document.querySelectorAll('.cashier-cell').forEach(cell => cell.classList.remove('cashier-selected'));
                    cell.classList.add('cashier-selected');
                });
            }

            cashierGrid.appendChild(cell);
        });
    }

    // Save reservations to localStorage
    function saveReservations() {
        const reservations = Array.from(document.querySelectorAll('#reservationTableBody tr')).map(row => ({
            name: row.cells[0].textContent,
            timeSlot: row.cells[1].textContent,
            pax: row.cells[2].textContent,
            contact: row.cells[3].textContent,
            tableNumber: row.cells[4].textContent,
        }));
        localStorage.setItem('reservations', JSON.stringify(reservations));
    }

    // Load reservations from localStorage
    function loadReservations() {
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const tableBody = document.getElementById('reservationTableBody');
        reservations.forEach(reservation => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${reservation.name}</td>
                <td>${reservation.timeSlot}</td>
                <td>${reservation.pax}</td>
                <td>${reservation.contact}</td>
                <td>${reservation.tableNumber}</td>
            `;
            tableBody.appendChild(newRow);
        });
    }

    // Check-Out Reservation Button
const checkOutReservationBtn = document.querySelector('.action-btn.checkout');

// Check-Out Logic
checkOutReservationBtn.addEventListener('click', function () {
    const selectedRow = document.querySelector('tr.selected');
    if (!selectedRow) {
        alert('Please select a reservation to check out.');
        return;
    }

    // Extract details from the selected row
    const name = selectedRow.cells[0].textContent;
    const timeIn = selectedRow.cells[1].textContent;
    const pax = selectedRow.cells[2].textContent;
    const contact = selectedRow.cells[3].textContent;
    const tableNumber = parseInt(selectedRow.cells[4].textContent, 10);
    const date = sessionStorage.getItem('selectedDate') || new Date().toISOString().split('T')[0];

    // Prompt for Check-Out Time
    const checkOutTime = prompt(
        'Enter Check-Out Time (HH:MM AM/PM):',
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    );

    if (!checkOutTime) {
        alert('Check-Out Time is required to complete the process.');
        return;
    }

    // Save to Checkout History
    const checkoutData = {
        name: name,
        timeIn: timeIn,
        timeOut: checkOutTime,
        pax: pax,
        contact: contact,
        tableNumber: tableNumber,
        date: date
    };

    const checkoutHistory = JSON.parse(localStorage.getItem('checkoutHistory')) || [];
    checkoutHistory.push(checkoutData);
    localStorage.setItem('checkoutHistory', JSON.stringify(checkoutHistory));

    // Mark the table as available in the selected time slot
    const tableIndex = tableNumber - 1;
    tableAvailability[timeIn][tableIndex] = true;
    saveTableAvailability(); // Save updated table status

    // Remove the reservation row
    selectedRow.remove();
    saveReservations(); // Save updated reservations

    // Update the cashier grid
    updateCashierGrid(timeIn);

    // Inform the user of the successful check-out
    alert(`Check-Out Completed for Table ${tableNumber}\nCheck-In Time: ${timeIn}\nCheck-Out Time: ${checkOutTime}`);
});

    // Update grid on time slot change
    timeSlotDropdown.addEventListener('change', function () {
        updateCashierGrid(timeSlotDropdown.value);
    });

    // Initialize form elements
    const formContainer = document.querySelector('.form-section');
    const addReservationBtn = document.querySelector('.action-btn:nth-child(1)');
    const editReservationBtn = document.querySelector('.action-btn:nth-child(2)');
    const addBtn = document.querySelector('.add-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const tableBody = document.getElementById('reservationTableBody');
    formContainer.style.display = 'none';

    // Enable row selection
    function enableRowSelection() {
        document.querySelectorAll('#reservationTableBody tr').forEach(row => {
            row.addEventListener('click', function () {
                document.querySelectorAll('#reservationTableBody tr').forEach(r => r.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }

    // Add Checkout History Button
    const checkoutHistoryBtn = document.createElement('button');
    checkoutHistoryBtn.textContent = 'Checkout History';
    checkoutHistoryBtn.className = 'action-btn';
    checkoutHistoryBtn.addEventListener('click', function() {
        window.location.href = 'checkout.html';
    });

    // Add the button to the button group
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup) {
        buttonGroup.appendChild(checkoutHistoryBtn);
    }

    // Add new reservation function
    function addNewReservation() {
        addBtn.onclick = function (e) {
            e.preventDefault();

            // Get form values
            const name = document.querySelector('input[placeholder="Enter name"]').value;
            const timeSlot = timeSlotDropdown.value;
            const pax = document.querySelector('input[placeholder="Enter number of guests"]').value;
            const contact = document.querySelector('input[placeholder="Enter contact number"]').value;
            const selectedTable = document.querySelector('.cashier-cell.cashier-selected');

            if (!selectedTable) {
                alert('Please select a table first!');
                return;
            }

            // Validate inputs
            if (!name || !timeSlot || !pax || !contact) {
                alert('Please fill in all fields.');
                return;
            }

            // Get table index
            const tableIndex = parseInt(selectedTable.dataset.tableNumber, 10) - 1;

            // Mark table as unavailable in the selected time slot
            tableAvailability[timeSlot][tableIndex] = false;
            saveTableAvailability(); // Save updated table status

            // Add reservation row
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${name}</td>
                <td>${timeSlot}</td>
                <td>${pax}</td>
                <td>${contact}</td>
                <td>${selectedTable.dataset.tableNumber}</td>
            `;
            tableBody.appendChild(newRow);
            saveReservations(); // Save updated reservations

            // Update grid
            updateCashierGrid(timeSlot);

            // Enable row selection
            enableRowSelection();

            // Clear form
            document.querySelectorAll('input').forEach(input => input.value = '');
            formContainer.style.display = 'none';
        };
    }

    // Edit reservation logic
    editReservationBtn.addEventListener('click', function () {
        const selectedRow = document.querySelector('tr.selected');
        if (!selectedRow) {
            alert('Please select a reservation to edit.');
            return;
        }

        // Populate the form with the selected reservation's details
        document.querySelector('input[placeholder="Enter name"]').value = selectedRow.cells[0].textContent;
        timeSlotDropdown.value = selectedRow.cells[1].textContent;
        document.querySelector('input[placeholder="Enter number of guests"]').value = selectedRow.cells[2].textContent;
        document.querySelector('input[placeholder="Enter contact number"]').value = selectedRow.cells[3].textContent;
        const oldTableNumber = parseInt(selectedRow.cells[4].textContent, 10);
        const oldTimeSlot = selectedRow.cells[1].textContent;

        formContainer.style.display = 'flex';

        // Override the add button to update the existing reservation
        addBtn.onclick = function (e) {
            e.preventDefault();
        
            // Get updated form values
            const updatedName = document.querySelector('input[placeholder="Enter name"]').value;
            const updatedTimeSlot = timeSlotDropdown.value;
            const updatedPax = document.querySelector('input[placeholder="Enter number of guests"]').value;
            const updatedContact = document.querySelector('input[placeholder="Enter contact number"]').value;
            const selectedTable = document.querySelector('.cashier-cell.cashier-selected');
        
            const newTableNumber = selectedTable ? parseInt(selectedTable.dataset.tableNumber, 10) : oldTableNumber;
        
            // Validate inputs
            if (!updatedName || !updatedTimeSlot || !updatedPax || !updatedContact) {
                alert('Please fill in all fields.');
                return;
            }
        
            // Update table availability only if table or time slot changes
            const oldTableIndex = oldTableNumber - 1;
            const newTableIndex = newTableNumber - 1;
        
            if (oldTimeSlot !== updatedTimeSlot || oldTableNumber !== newTableNumber) {
                // Release old table in old time slot
                tableAvailability[oldTimeSlot][oldTableIndex] = true;
        
                // Mark new table as unavailable in new time slot
                tableAvailability[updatedTimeSlot][newTableIndex] = false;
            }
            saveTableAvailability();
        
            // Update selected row
            selectedRow.cells[0].textContent = updatedName;
            selectedRow.cells[1].textContent = updatedTimeSlot;
            selectedRow.cells[2].textContent = updatedPax;
            selectedRow.cells[3].textContent = updatedContact;
            selectedRow.cells[4].textContent = newTableNumber;
        
            saveReservations(); // Save updated reservations
            updateCashierGrid(updatedTimeSlot); // Update grid
        
            // Clear form
            document.querySelectorAll('input').forEach(input => input.value = '');
            formContainer.style.display = 'none';
        
            // Reset to add new reservation mode
            addNewReservation();
        
            alert('Reservation successfully updated.');
        };
        
    });

    cancelBtn.addEventListener('click', function () {
        document.querySelectorAll('input').forEach(input => input.value = '');
        formContainer.style.display = 'none';
        // Reset to add new reservation mode
        addNewReservation();
    });

    addReservationBtn.addEventListener('click', function () {
        formContainer.style.display = 'flex';
        document.querySelectorAll('input').forEach(input => input.value = '');
        // Ensure we're in add new reservation mode
        addNewReservation();
    });

    // Load saved data on page load
    loadReservations();
    updateCashierGrid(timeSlotDropdown.value);
    enableRowSelection();
    
    // Initialize add new reservation mode
    addNewReservation();
});