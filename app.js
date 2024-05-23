document.addEventListener('DOMContentLoaded', function() {
    // Get elements from the HTML
    var expenseNameInput = document.getElementById('expense-name');
    var expenseAmountInput = document.getElementById('expense-amount');
    var expenseDateInput = document.getElementById('expense-date');
    var addExpenseBtn = document.getElementById('add-expense-btn');
    var expenseItems = document.getElementById('expense-items');
    var dailyTotalAmountSpan = document.getElementById('daily-total-amount');
    var monthlyTotalAmountSpan = document.getElementById('monthly-total-amount');
    var dateList = document.getElementById('date-list');

    // Key to save data in LocalStorage
    var LOCAL_STORAGE_KEY = 'expenses';
    // Get data from LocalStorage or create an empty list
    var expenses = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

    // Function to save expenses to LocalStorage
    function saveExpensesToLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
    }

    // Update the total amount for the current month
    function updateMonthlyTotal() {
        var currentMonth = new Date().getMonth(); // Get the current month
        var currentYear = new Date().getFullYear(); // Get the current year
        var monthlyTotal = expenses.filter(function(expense) {
            var expenseDate = new Date(expense.date); // Convert the expense date
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        }).reduce(function(sum, expense) {
            return sum + parseFloat(expense.amount); // Sum up the expenses for the month
        }, 0);
        monthlyTotalAmountSpan.textContent = monthlyTotal.toFixed(2); // Show the monthly total
    }

    // Update the total amount for the selected day
    function updateDailyTotal(selectedDate) {
        var dailyTotal = expenses.filter(function(expense) {
            return expense.date === selectedDate; // Filter the expenses for the selected day
        }).reduce(function(sum, expense) {
            return sum + parseFloat(expense.amount); // Sum up the expenses for the day
        }, 0);
        dailyTotalAmountSpan.textContent = dailyTotal.toFixed(2); // Show the daily total
    }

    // Group expenses by date
    function groupExpensesByDate() {
        var dates = {};
        expenses.forEach(function(expense) {
            if (!dates[expense.date]) {
                dates[expense.date] = [];
            }
            dates[expense.date].push(expense); // Add expense to the corresponding date
        });
        return dates;
    }

    // Show dates in the dropdown menu
    function renderDates() {
        dateList.innerHTML = '<option value="" disabled selected>Select a date</option>';
        var dates = Object.keys(groupExpensesByDate());
        dates.forEach(function(date) {
            var option = document.createElement('option');
            option.value = date;
            option.textContent = formatDate(date); // Format the date for display
            dateList.appendChild(option);
        });
    }

    // Format date to dd-mm-yyyy
    function formatDate(dateString) {
        var date = new Date(dateString);
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0'); 
        var year = date.getFullYear();
        return `${day}-${month}-${year}`; // Return formatted date
    }

    // When a date is selected from the dropdown
    dateList.addEventListener('change', function(event) {
        var selectedDate = event.target.value;
        renderExpenses(selectedDate); // Show expenses for the selected date
        updateDailyTotal(selectedDate); // Update daily total for the selected date
    });

    // Show the expenses for the selected date
    function renderExpenses(selectedDate) {
        expenseItems.innerHTML = '';
        var dateExpenses = groupExpensesByDate()[selectedDate] || [];
        dateExpenses.forEach(function(expense, index) {
            var li = document.createElement('li');
            li.innerHTML = `${expense.name} - €${expense.amount} <button data-index="${index}">Delete</button>`;
            expenseItems.appendChild(li); // Add expense to the list
        });
    }

    // Add a new expense
    function addExpense() {
        var name = expenseNameInput.value.trim();
        var amount = parseFloat(expenseAmountInput.value.trim());
        var date = expenseDateInput.value.trim();

        if (name && !isNaN(amount) && date) { // Check if inputs are valid
            expenses.push({ name: name, amount: amount, date: date }); // Add expense to the list
            saveExpensesToLocalStorage(); // Save the updated list to LocalStorage
            renderDates(); // Update the dates in the dropdown
            renderExpenses(date); // Show the expenses for the current date
            updateDailyTotal(date); // Update the daily total
            updateMonthlyTotal(); // Update the monthly total
            expenseNameInput.value = ''; // Clear the input fields
            expenseAmountInput.value = '';
            expenseDateInput.value = formatDate(new Date()); // Reset date input to current date
        } else {
            alert('Please enter a valid name, amount, and date'); // Show an error if inputs are invalid
        }
    }

    // Delete an expense
    function deleteExpense(index) {
        expenses.splice(index, 1); // Remove the expense from the list
        saveExpensesToLocalStorage(); // Save the updated list to LocalStorage
        renderDates(); // Update the dates in the dropdown
        renderExpenses(); // Show the expenses
        updateDailyTotal(); // Update the daily total
        updateMonthlyTotal(); // Update the monthly total
    }

    // When the "Add Expense" button is clicked
    addExpenseBtn.addEventListener('click', addExpense);

    // When the "Delete" button is clicked on an expense
    expenseItems.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') { // Check if a delete button was clicked
            var index = event.target.getAttribute('data-index'); // Get the index of the expense
            deleteExpense(index); // Delete the expense
        }
    });

    // Initial rendering of dates and totals
    renderDates();
    updateMonthlyTotal();

    // Initialize date input to current date
    expenseDateInput.value = formatDate(new Date());
});
