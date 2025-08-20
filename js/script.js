document.getElementById('calculator-form').addEventListener('submit', function(event) {
    event.preventDefault();
    calculate();
});

function calculate() {
    const principal = parseFloat(document.getElementById('principal').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    const reinvestInterest = document.getElementById('reinvest-interest').checked;
    const annualContribution = parseFloat(document.getElementById('annual-contribution').value);
    const contributionIncrease = parseFloat(document.getElementById('contribution-increase').value) / 100;

    if (isNaN(principal) || isNaN(interestRate) || isNaN(years) || isNaN(annualContribution) || isNaN(contributionIncrease)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }

    let currentBalance = principal;
    const breakdownBody = document.getElementById('breakdown-body');
    breakdownBody.innerHTML = ''; // Clear previous results

    let contributionForYear = annualContribution;

    for (let i = 1; i <= years; i++) {
        const startingBalance = currentBalance;

        const interestEarnedThisYear = (reinvestInterest ? currentBalance : principal) * interestRate;
        currentBalance += interestEarnedThisYear;

        let contributionAdded = 0;
        if (contributionForYear > 0) {
            currentBalance += contributionForYear;
            contributionAdded = contributionForYear;
            // Increase contribution for the next year
            contributionForYear *= (1 + contributionIncrease);
        }

        const endingBalance = currentBalance;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td>${startingBalance.toFixed(2)}</td>
            <td>${interestEarnedThisYear.toFixed(2)}</td>
            <td>${contributionAdded.toFixed(2)}</td>
            <td>${endingBalance.toFixed(2)}</td>
        `;
        breakdownBody.appendChild(row);
    }

    document.getElementById('total-balance').textContent = `$${currentBalance.toFixed(2)}`;
    document.getElementById('result').classList.remove('hidden');
}
