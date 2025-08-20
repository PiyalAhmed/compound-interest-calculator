document.getElementById('calculator-form').addEventListener('submit', function(event) {
    event.preventDefault();
    calculate();
});

function calculate() {
    // --- 1. GET AND PARSE INPUTS ---
    const principal = parseFloat(document.getElementById('principal').value);
    const annualInterestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    const reinvestInterest = document.getElementById('reinvest-interest').checked;
    const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value);
    const contributionIncreasePercent = parseFloat(document.getElementById('contribution-increase').value) / 100;
    const compoundingPeriodsPerYear = parseInt(document.getElementById('compound-period').value);

    if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(years) || isNaN(monthlyContribution) || isNaN(contributionIncreasePercent)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }

    // --- 2. INITIALIZE VARIABLES ---
    const totalMonths = years * 12;
    const monthsPerCompoundingPeriod = 12 / compoundingPeriodsPerYear;

    let currentBalance = principal;
    let nonCompoundingBalance = principal;

    let totalInterestEarned = 0;
    let totalContributions = 0;
    let currentMonthlyContribution = monthlyContribution;

    const breakdownBody = document.getElementById('breakdown-body');
    breakdownBody.innerHTML = '';

    document.getElementById('encashed-interest-p').classList.add('hidden');
    document.getElementById('compounded-interest-p').classList.add('hidden');

    let yearlyInterest = 0;
    let yearlyContribution = 0;
    let yearStartingBalance = principal;

    // --- 3. CALCULATION LOOP ---
    for (let month = 1; month <= totalMonths; month++) {
        // Add monthly contribution first
        if (currentMonthlyContribution > 0) {
            totalContributions += currentMonthlyContribution;
            if (reinvestInterest) {
                currentBalance += currentMonthlyContribution;
            } else {
                nonCompoundingBalance += currentMonthlyContribution;
            }
        }

        // Calculate and add interest only at the end of a compounding period
        if (month % monthsPerCompoundingPeriod === 0) {
            const interestThisPeriod = (reinvestInterest ? currentBalance : principal) * (annualInterestRate / compoundingPeriodsPerYear);
            totalInterestEarned += interestThisPeriod;
            yearlyInterest += interestThisPeriod;

            if (reinvestInterest) {
                currentBalance += interestThisPeriod;
            }
        }

        // Accumulate yearly contribution amount for the table display
        yearlyContribution += currentMonthlyContribution;

        // At the end of each year, update the breakdown table
        if (month % 12 === 0) {
            const year = month / 12;
            const endingBalanceForYear = reinvestInterest ? currentBalance : nonCompoundingBalance;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${year}</td>
                <td>${yearStartingBalance.toFixed(2)}</td>
                <td>${yearlyInterest.toFixed(2)}</td>
                <td>${yearlyContribution.toFixed(2)}</td>
                <td>${endingBalanceForYear.toFixed(2)}</td>
            `;
            breakdownBody.appendChild(row);

            yearStartingBalance = endingBalanceForYear;
            yearlyInterest = 0;
            yearlyContribution = 0;

            currentMonthlyContribution *= (1 + contributionIncreasePercent);
        }
    }

    // --- 4. DISPLAY RESULTS ---
    const totalInvested = principal + totalContributions;
    const finalBalance = reinvestInterest ? currentBalance : nonCompoundingBalance + totalInterestEarned;

    document.getElementById('total-balance').textContent = `$${finalBalance.toFixed(2)}`;
    document.getElementById('total-invested').textContent = `$${totalInvested.toFixed(2)}`;
    document.getElementById('total-interest').textContent = `$${totalInterestEarned.toFixed(2)}`;

    if (reinvestInterest) {
        document.getElementById('compounded-interest').textContent = `$${totalInterestEarned.toFixed(2)}`;
        document.getElementById('compounded-interest-p').classList.remove('hidden');
    } else {
        document.getElementById('encashed-interest').textContent = `$${totalInterestEarned.toFixed(2)}`;
        document.getElementById('encashed-interest-p').classList.remove('hidden');
    }

    document.getElementById('result').classList.remove('hidden');
}
