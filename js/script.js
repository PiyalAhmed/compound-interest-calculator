document.getElementById('calculator-form').addEventListener('submit', function(event) {
    event.preventDefault();
    calculate();
});

function calculate() {
    // --- 1. GET AND PARSE INPUTS ---
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const annualInterestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    const reinvestInterest = document.getElementById('reinvest-interest').checked;
    const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value) || 0;
    const contributionIncreasePercent = (parseFloat(document.getElementById('contribution-increase').value) || 0) / 100;
    const compoundingPeriodsPerYear = parseInt(document.getElementById('compound-period').value);

    if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(years) || isNaN(monthlyContribution) || isNaN(contributionIncreasePercent)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }

    // --- 2. INITIALIZE VARIABLES ---
    const totalMonths = years * 12;
    const monthsPerCompoundingPeriod = 12 / compoundingPeriodsPerYear;

    let currentBalance = principal;
    let totalInterestEarned = 0;
    let totalContributions = 0;
    let totalEncashedInterest = 0;
    let currentMonthlyContribution = monthlyContribution;

    const breakdownBody = document.getElementById('breakdown-body');
    breakdownBody.innerHTML = '';

    document.getElementById('encashed-interest-p').classList.add('hidden');
    document.getElementById('compounded-interest-p').classList.add('hidden');

    let yearlyData = { interest: 0, contribution: 0, startingBalance: principal };
    const monthlyBreakdownData = {};
    const chartLabels = ['Start'];
    const balanceData = [principal];
    const totalContributionsData = [0];
    const totalInterestData = [0];

    // --- 3. CALCULATION LOOP (MONTH BY MONTH) ---
    for (let month = 1; month <= totalMonths; month++) {
        const interestThisPeriod = (month % monthsPerCompoundingPeriod === 0)
            ? (reinvestInterest ? currentBalance : principal) * (annualInterestRate / compoundingPeriodsPerYear)
            : 0;

        currentBalance += currentMonthlyContribution;
        if (reinvestInterest) {
            currentBalance += interestThisPeriod;
        } else {
            totalEncashedInterest += interestThisPeriod;
        }

        totalContributions += currentMonthlyContribution;
        totalInterestEarned += interestThisPeriod;
        yearlyData.contribution += currentMonthlyContribution;
        yearlyData.interest += interestThisPeriod;

        const yearForMonthlyData = Math.ceil(month / 12);
        if (!monthlyBreakdownData[yearForMonthlyData]) {
            monthlyBreakdownData[yearForMonthlyData] = [];
        }
        monthlyBreakdownData[yearForMonthlyData].push({
            month: month,
            contribution: currentMonthlyContribution,
            interest: interestThisPeriod,
            endingBalance: currentBalance
        });

        if (month % 12 === 0) {
            const year = month / 12;
            const row = document.createElement('tr');
            row.setAttribute('data-year', year);
            row.innerHTML = `
                <td>${year}</td>
                <td>${yearlyData.startingBalance.toFixed(2)}</td>
                <td>${yearlyData.interest.toFixed(2)}</td>
                <td>${yearlyData.contribution.toFixed(2)}</td>
                <td>${currentBalance.toFixed(2)}</td>
            `;
            breakdownBody.appendChild(row);

            yearlyData.startingBalance = currentBalance;
            yearlyData.interest = 0;
            yearlyData.contribution = 0;
            currentMonthlyContribution *= (1 + contributionIncreasePercent);

            chartLabels.push(`Year ${year}`);
            balanceData.push(reinvestInterest ? currentBalance : currentBalance + totalEncashedInterest);
            totalContributionsData.push(totalContributions);
            totalInterestData.push(totalInterestEarned);
        }
    }

    // --- 4. DISPLAY RESULTS ---
    const totalInvested = principal + totalContributions;
    const finalBalance = reinvestInterest ? currentBalance : currentBalance + totalEncashedInterest;

    document.getElementById('total-balance').textContent = `$${finalBalance.toFixed(2)}`;
    document.getElementById('total-invested').textContent = `$${totalInvested.toFixed(2)}`;
    document.getElementById('total-interest').textContent = `$${totalInterestEarned.toFixed(2)}`;

    if (reinvestInterest) {
        document.getElementById('compounded-interest').textContent = `$${totalInterestEarned.toFixed(2)}`;
        document.getElementById('compounded-interest-p').classList.remove('hidden');
    } else {
        document.getElementById('encashed-interest').textContent = `$${totalEncashedInterest.toFixed(2)}`;
        document.getElementById('encashed-interest-p').classList.remove('hidden');
    }

    document.getElementById('result').classList.remove('hidden');
    renderChart(chartLabels, balanceData, totalContributionsData, totalInterestData);
    addTableExpandListener(monthlyBreakdownData);
}

function addTableExpandListener(monthlyData) {
    const tableBody = document.getElementById('breakdown-body');
    tableBody.addEventListener('click', function(event) {
        const row = event.target.closest('tr[data-year]');
        if (!row) return;

        const year = row.dataset.year;
        const yearData = monthlyData[year];

        const existingMonthlyRows = tableBody.querySelectorAll(`.monthly-row-for-year-${year}`);
        if (existingMonthlyRows.length > 0) {
            existingMonthlyRows.forEach(r => r.remove());
            row.classList.remove('expanded');
            return;
        }

        row.classList.add('expanded');
        const fragment = document.createDocumentFragment();
        let lastMonthBalance = parseFloat(row.cells[1].innerText.replace(/,/g, ''));

        const headerRow = document.createElement('tr');
        headerRow.classList.add('monthly-row', `monthly-row-for-year-${year}`);
        headerRow.innerHTML = `
            <th>Month</th>
            <th>Starting Balance</th>
            <th>Interest Earned</th>
            <th>Contribution</th>
            <th>Ending Balance</th>
        `;
        fragment.appendChild(headerRow);

        yearData.forEach((data, index) => {
            const monthlyRow = document.createElement('tr');
            monthlyRow.classList.add('monthly-row', `monthly-row-for-year-${year}`);

            const startOfMonthBalance = (index === 0)
                ? lastMonthBalance
                : yearData[index - 1].endingBalance - yearData[index - 1].contribution - (data.interest > 0 ? yearData[index-1].interest : 0) ;

            monthlyRow.innerHTML = `
                <td>${data.month}</td>
                <td>${startOfMonthBalance.toFixed(2)}</td>
                <td>${data.interest.toFixed(2)}</td>
                <td>${data.contribution.toFixed(2)}</td>
                <td>${data.endingBalance.toFixed(2)}</td>
            `;
            fragment.appendChild(monthlyRow);
        });

        row.after(fragment);
    });
}

let investmentChart = null;

function renderChart(labels, balanceData, contributionsData, interestData) {
    const ctx = document.getElementById('investment-chart').getContext('2d');

    if (investmentChart) {
        investmentChart.destroy();
    }

    investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Contributions',
                    data: contributionsData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                },
                {
                    label: 'Total Interest',
                    data: interestData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                },
                {
                    label: 'Total Balance',
                    data: balanceData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Investment Growth Over Time'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value ($)'
                    }
                }
            }
        }
    });
}
