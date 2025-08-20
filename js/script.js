document.getElementById('calculator-form').addEventListener('submit', function(event) {
    event.preventDefault();
    calculate();
});

function calculate() {
    const principal = parseFloat(document.getElementById('principal').value);
    const annualInterestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    const reinvestInterest = document.getElementById('reinvest-interest').checked;
    const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value);
    const contributionIncreasePercent = parseFloat(document.getElementById('contribution-increase').value) / 100;

    if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(years) || isNaN(monthlyContribution) || isNaN(contributionIncreasePercent)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }

    const monthlyInterestRate = annualInterestRate / 12;
    const totalMonths = years * 12;

    let currentBalance = principal;
    let totalInterestEarned = 0;
    let totalContributions = 0;
    let currentMonthlyContribution = monthlyContribution;

    const breakdownBody = document.getElementById('breakdown-body');
    breakdownBody.innerHTML = ''; // Clear previous results

    let yearlyInterest = 0;
    let yearlyContribution = 0;
    let yearStartingBalance = principal;

    for (let month = 1; month <= totalMonths; month++) {
        // Calculate interest for the current month
        const interestThisMonth = (reinvestInterest ? currentBalance : principal) * monthlyInterestRate;
        currentBalance += interestThisMonth;
        totalInterestEarned += interestThisMonth;
        yearlyInterest += interestThisMonth;

        // Add monthly contribution
        if (currentMonthlyContribution > 0) {
            currentBalance += currentMonthlyContribution;
            totalContributions += currentMonthlyContribution;
            yearlyContribution += currentMonthlyContribution;
        }

        // At the end of each year, update the breakdown table and increase the contribution
        if (month % 12 === 0) {
            const year = month / 12;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${year}</td>
                <td>${yearStartingBalance.toFixed(2)}</td>
                <td>${yearlyInterest.toFixed(2)}</td>
                <td>${yearlyContribution.toFixed(2)}</td>
                <td>${currentBalance.toFixed(2)}</td>
            `;
            breakdownBody.appendChild(row);

            // Reset for next year
            yearStartingBalance = currentBalance;
            yearlyInterest = 0;
            yearlyContribution = 0;

            // Increase the monthly contribution for the next year
            currentMonthlyContribution *= (1 + contributionIncreasePercent);
        }
    }

    const totalInvested = principal + totalContributions;

    document.getElementById('total-balance').textContent = `$${currentBalance.toFixed(2)}`;
    document.getElementById('total-invested').textContent = `$${totalInvested.toFixed(2)}`;
    document.getElementById('total-interest').textContent = `$${totalInterestEarned.toFixed(2)}`;
    document.getElementById('result').classList.remove('hidden');
}
