document.addEventListener('DOMContentLoaded', function() {
    var expenseNameInput = document.getElementById('expense-name');
    var expenseAmountInput = document.getElementById('expense-amount');
    var expenseDateInput = document.getElementById('expense-date');
    var addExpenseBtn = document.getElementById('add-expense-btn');
    var expenseItems = document.getElementById('expense-items');
    var dailyTotalAmountSpan = document.getElementById('daily-total-amount');
    var monthlyTotalAmountSpan = document.getElementById('monthly-total-amount');
    var dateList = document.getElementById('date-list');

    var LOCAL_STORAGE_KEY = 'expenses';
    var expenses = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

    function saveExpensesToLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
    }

    function updateMonthlyTotal() {
        var currentMonth = new Date().getMonth();
        var currentYear = new Date().getFullYear();
        var monthlyTotal = expenses.filter(function(expense) {
            var expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        }).reduce(function(sum, expense) {
            return sum + parseFloat(expense.amount);
        }, 0);
        monthlyTotalAmountSpan.textContent = monthlyTotal.toFixed(2);
    }

    function updateDailyTotal(selectedDate) {
        var dailyTotal = expenses.filter(function(expense) {
            return expense.date === selectedDate;
        }).reduce(function(sum, expense) {
            return sum + parseFloat(expense.amount);
        }, 0);
        dailyTotalAmountSpan.textContent = dailyTotal.toFixed(2);
    }

    function groupExpensesByDate() {
        var dates = {};
        expenses.forEach(function(expense) {
            if (!dates[expense.date]) {
                dates[expense.date] = [];
            }
            dates[expense.date].push(expense);
        });
        return dates;
    }

    function renderDates() {
        dateList.innerHTML = '<option value="" disabled selected>Select a date</option>';
        var dates = Object.keys(groupExpensesByDate());
        dates.forEach(function(date) {
            var option = document.createElement('option');
            option.value = date;
            option.textContent = formatDisplayDate(date);
            dateList.appendChild(option);
        });
    }

    function formatDateToInput(date) {
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        var year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    function formatDisplayDate(dateString) {
        var date = new Date(dateString);
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        var year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function parseDateFromInput(dateString) {
        var [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    dateList.addEventListener('change', function(event) {
        var selectedDate = event.target.value;
        renderExpenses(selectedDate);
        updateDailyTotal(selectedDate);
    });

    function renderExpenses(selectedDate) {
        expenseItems.innerHTML = '';
        var dateExpenses = groupExpensesByDate()[selectedDate] || [];
        dateExpenses.forEach(function(expense, index) {
            var li = document.createElement('li');
            li.innerHTML = `${expense.name} - €${expense.amount} <button data-index="${index}">Delete</button>`;
            expenseItems.appendChild(li);
        });
    }

    function addExpense() {
        var name = expenseNameInput.value.trim();
        var amount = parseFloat(expenseAmountInput.value.trim());
        var date = expenseDateInput.value.trim();

        if (name && !isNaN(amount) && date) {
            var formattedDate = formatDateToInput(new Date(date));
            expenses.push({ name: name, amount: amount, date: formattedDate });
            saveExpensesToLocalStorage();
            renderDates();
            renderExpenses(formattedDate);
            updateDailyTotal(formattedDate);
            updateMonthlyTotal();
            expenseNameInput.value = '';
            expenseAmountInput.value = '';
            expenseDateInput.value = formatDateToInput(new Date());
        } else {
            alert('Please enter a valid name, amount, and date');
        }
    }

    function deleteExpense(index) {
        expenses.splice(index, 1);
        saveExpensesToLocalStorage();
        renderDates();
        renderExpenses();
        updateDailyTotal();
        updateMonthlyTotal();
    }

    addExpenseBtn.addEventListener('click', addExpense);

    expenseItems.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            var index = event.target.getAttribute('data-index');
            deleteExpense(index);
        }
    });

    renderDates();
    updateMonthlyTotal();

    // Initialize date input to current date in yyyy-mm-dd format
    expenseDateInput.value = formatDateToInput(new Date());
});
