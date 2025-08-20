// Format numbers with commas for money display
function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Round up to the nearest appropriate thousand, ten thousand, hundred thousand, or million
function roundUpToNearestUnit(value) {
    if (value <= 0) return 1000;
    
    // Determine the appropriate unit based on the value
    if (value >= 1000000) {
        // For millions, round up to nearest 100,000
        return Math.ceil(value / 100000) * 100000;
    } else if (value >= 100000) {
        // For hundreds of thousands, round up to nearest 10,000
        return Math.ceil(value / 10000) * 10000;
    } else if (value >= 10000) {
        // For tens of thousands, round up to nearest 1,000
        return Math.ceil(value / 1000) * 1000;
    } else if (value >= 1000) {
        // For thousands, round up to nearest 100
        return Math.ceil(value / 100) * 100;
    } else {
        // For smaller values, round up to nearest 10
        return Math.ceil(value / 10) * 10;
    }
}

// Format numbers with commas (no currency symbol)
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Calculate with default values on page load
    calculate();
});

document.getElementById('calculator-form').addEventListener('submit', function(event) {
    event.preventDefault();
    calculate();
});

function calculate() {
    // --- 1. GET AND PARSE INPUTS ---
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const annualInterestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const years = parseInt(document.getElementById('years').value);
    const reinvestInterest = document.querySelector('input[name="interest-strategy"]:checked').value === 'reinvest';
    const additionalContribution = parseFloat(document.getElementById('additional-contribution').value) || 0;
    const contributionIncreasePercent = (parseFloat(document.getElementById('contribution-increase').value) || 0) / 100;
    const compoundingPeriodsPerYear = parseInt(document.getElementById('compound-period').value);
    
    // New contribution timing options
    const contributionTiming = document.querySelector('input[name="contribution-timing"]:checked').value;
    const contributionFrequency = document.querySelector('input[name="contribution-frequency"]:checked').value;

    if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(years) || isNaN(additionalContribution) || isNaN(contributionIncreasePercent)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }

    // --- 2. INITIALIZE VARIABLES ---
    const totalMonths = years * 12;
    const monthsPerCompoundingPeriod = 12 / compoundingPeriodsPerYear;
    const monthlyInterestRate = annualInterestRate / 12;

    let currentBalance = principal;
    let totalInterestEarned = 0;
    let totalContributions = 0;
    let totalEncashedInterest = 0;
    let interestBucket = 0; // Holds accrued interest before compounding
    let currentAdditionalContribution = additionalContribution;

    const breakdownBody = document.getElementById('breakdown-body');
    breakdownBody.innerHTML = '';

    document.getElementById('encashed-interest-p').classList.add('hidden');

    let yearlyData = { interest: 0, contribution: 0, startingBalance: principal };
    const monthlyBreakdownData = {};
    const chartLabels = ['Start'];
    const balanceData = [principal];
    const totalContributionsData = [0];
    const totalInterestData = [0];

    // --- 3. CALCULATION LOOP (MONTH BY MONTH) ---
    for (let month = 1; month <= totalMonths; month++) {
        let monthStartingBalance = currentBalance;
        let contributionThisMonth = 0;
        
        // 3a. Add contribution at start of period if applicable
        if (contributionFrequency === 'month') {
            // Monthly contribution
            if (contributionTiming === 'start') {
                // Add contribution at start of month (before interest calculation)
                contributionThisMonth = currentAdditionalContribution;
                currentBalance += contributionThisMonth;
                totalContributions += contributionThisMonth;
                yearlyData.contribution += contributionThisMonth;
                monthStartingBalance = currentBalance; // Update starting balance to include contribution
            }
        } else {
            // Yearly contribution
            if (month % 12 === 1 && contributionTiming === 'start') {
                // Add yearly contribution at start of year
                contributionThisMonth = currentAdditionalContribution * 12;
                currentBalance += contributionThisMonth;
                totalContributions += contributionThisMonth;
                yearlyData.contribution += contributionThisMonth;
                monthStartingBalance = currentBalance; // Update starting balance to include contribution
            }
        }

        // 3b. Calculate interest on the current balance (including start-of-period contributions)
        const baseForInterest = monthStartingBalance + (reinvestInterest ? interestBucket : 0);
        const interestThisMonth = baseForInterest * monthlyInterestRate;
        
        interestBucket += interestThisMonth;
        totalInterestEarned += interestThisMonth;
        yearlyData.interest += interestThisMonth;

        // 3c. Add contribution at end of period if applicable
        if (contributionFrequency === 'month') {
            // Monthly contribution
            if (contributionTiming === 'end') {
                // Add contribution at end of month (after interest calculation)
                contributionThisMonth = currentAdditionalContribution;
                currentBalance += contributionThisMonth;
                totalContributions += contributionThisMonth;
                yearlyData.contribution += contributionThisMonth;
            }
        } else {
            // Yearly contribution
            if (month % 12 === 0 && contributionTiming === 'end') {
                // Add yearly contribution at end of year
                contributionThisMonth = currentAdditionalContribution * 12;
                currentBalance += contributionThisMonth;
                totalContributions += contributionThisMonth;
                yearlyData.contribution += contributionThisMonth;
            }
        }

        // 3d. Check if it's the end of a compounding period
        if (month % monthsPerCompoundingPeriod === 0) {
            if (reinvestInterest) {
                currentBalance += interestBucket; // Compound the accrued interest
            } else {
                totalEncashedInterest += interestBucket; // Move accrued interest to encashed total
            }
            interestBucket = 0; // Reset the bucket
        }

        // 3e. Store monthly data with proper balance calculations
        const yearForMonthlyData = Math.ceil(month / 12);
        if (!monthlyBreakdownData[yearForMonthlyData]) {
            monthlyBreakdownData[yearForMonthlyData] = [];
        }
        
        // Calculate true ending balance including all accumulated interest
        const trueEndingBalance = currentBalance + (reinvestInterest ? interestBucket : totalEncashedInterest);
        
        monthlyBreakdownData[yearForMonthlyData].push({
            month: month,
            contribution: contributionThisMonth,
            interest: interestThisMonth,
            endingBalance: trueEndingBalance,
            startingBalance: monthStartingBalance
        });

        // 3f. Check for end of year to update table and chart data
        if (month % 12 === 0) {
            const year = month / 12;
            const row = document.createElement('tr');
            row.setAttribute('data-year', year);

            const endingBalanceForTable = currentBalance + (reinvestInterest ? interestBucket : totalEncashedInterest);

            row.innerHTML = `
                <td>${year}</td>
                <td>${formatMoney(yearlyData.startingBalance)}</td>
                <td>${formatMoney(yearlyData.interest)}</td>
                <td>${formatMoney(yearlyData.contribution)}</td>
                <td>${formatMoney(endingBalanceForTable)}</td>
            `;
            breakdownBody.appendChild(row);

            yearlyData.startingBalance = endingBalanceForTable;
            yearlyData.interest = 0;
            yearlyData.contribution = 0;
            
            // Update contribution for next year
            currentAdditionalContribution *= (1 + contributionIncreasePercent);

            chartLabels.push(`Year ${year}`);
            balanceData.push(endingBalanceForTable);
            totalContributionsData.push(totalContributions);
            totalInterestData.push(totalInterestEarned);
        }
    }

    // --- 3g. HANDLE LEFTOVER INTEREST (Edge case fix) ---
    // If there's remaining interest in the bucket at the end, process it
    if (interestBucket > 0) {
        if (reinvestInterest) {
            currentBalance += interestBucket;
        } else {
            totalEncashedInterest += interestBucket;
        }
        interestBucket = 0;
    }

    // --- 4. DISPLAY RESULTS ---
    const totalInvested = principal + totalContributions;
    const finalBalance = currentBalance + totalEncashedInterest;

    document.getElementById('total-balance').textContent = formatMoney(finalBalance);
    document.getElementById('total-invested').textContent = formatMoney(totalInvested);
    document.getElementById('total-interest').textContent = formatMoney(totalInterestEarned);

    if (!reinvestInterest) {
        document.getElementById('encashed-interest').textContent = formatMoney(totalEncashedInterest);
        document.getElementById('encashed-interest-p').classList.remove('hidden');
    }

    document.getElementById('result').classList.remove('hidden');
    document.getElementById('stats').classList.remove('hidden');
    renderChart(chartLabels, balanceData, totalContributionsData, totalInterestData);
    addTableExpandListener(monthlyBreakdownData, reinvestInterest);
}

function addTableExpandListener(monthlyData, reinvestInterest) {
    const tableBody = document.getElementById('breakdown-body');
    
    // Remove existing listeners to prevent duplicates
    const newTableBody = tableBody.cloneNode(true);
    tableBody.parentNode.replaceChild(newTableBody, tableBody);
    
    newTableBody.addEventListener('click', function(event) {
        const row = event.target.closest('tr[data-year]');
        if (!row) return;

        const year = row.dataset.year;
        const yearData = monthlyData[year];

        const existingMonthlyRows = newTableBody.querySelectorAll(`.monthly-row-for-year-${year}`);
        if (existingMonthlyRows.length > 0) {
            existingMonthlyRows.forEach(r => r.remove());
            row.classList.remove('expanded');
            return;
        }

        row.classList.add('expanded');
        const fragment = document.createDocumentFragment();

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

            monthlyRow.innerHTML = `
                <td>${data.month}</td>
                <td>${formatMoney(data.startingBalance)}</td>
                <td>${formatMoney(data.interest)}</td>
                <td>${formatMoney(data.contribution)}</td>
                <td>${formatMoney(data.endingBalance)}</td>
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

    // Calculate the maximum value across all datasets for y-axis scaling
    const maxValue = Math.max(
        Math.max(...balanceData),
        Math.max(...contributionsData),
        Math.max(...interestData)
    );
    
    // Round up to the nearest appropriate unit
    const yAxisMax = roundUpToNearestUnit(maxValue);
    
    // Debug logging
    console.log('Chart Data - Max Value:', maxValue, 'Y-Axis Max:', yAxisMax);

    // Chart colors matching the summary cards
    const chartColors = {
        contributions: '#ff9f40', // Orange - friendly alternative to red
        interest: '#36a2eb',      // Blue - matches card 2
        balance: '#4bc0c0'        // Teal - matches card 3
    };
    
    // Update card colors to match chart colors
    updateCardColors(chartColors);

    investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Contributions',
                    data: contributionsData,
                    borderColor: chartColors.contributions,
                    backgroundColor: chartColors.contributions + '20',
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: chartColors.contributions,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3
                },
                {
                    label: 'Total Interest',
                    data: interestData,
                    borderColor: chartColors.interest,
                    backgroundColor: chartColors.interest + '20',
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: chartColors.interest,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3
                },
                {
                    label: 'Total Balance',
                    data: balanceData,
                    borderColor: chartColors.balance,
                    backgroundColor: chartColors.balance + '20',
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: chartColors.balance,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Investment Growth Over Time',
                    font: {
                        size: 16,
                        weight: '600'
                    }
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatMoney(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Year'
                    },
                    grid: {
                        display: true
                    }
                },
                y: {
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Value ($)',
                        font: {
                            size: 14,
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    beginAtZero: true,
                    suggestedMax: yAxisMax,
                    ticks: {
                        // Generate exactly 10 tick values
                        callback: function(value, index, values) {
                            return formatMoney(value);
                        },
                        // Force exactly 10 ticks by providing the values
                        values: function(context) {
                            const max = yAxisMax;
                            const step = max / 10;
                            const ticks = [];
                            
                            for (let i = 0; i <= 10; i++) {
                                ticks.push(Math.round(step * i * 100) / 100);
                            }
                            
                            console.log('Generated Y-axis ticks:', ticks);
                            return ticks;
                        },
                        autoSkip: false,
                        font: {
                            size: 12
                        },
                        padding: 8,
                        color: '#666'
                    },
                    border: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.2)',
                        width: 1
                    },
                    afterFit: function(axis) {
                        // Ensure proper spacing for y-axis labels
                        axis.paddingRight = 10;
                    }
                }
            },
            layout: {
                padding: {
                    top: 30,
                    right: 30,
                    bottom: 30,
                    left: 50
                }
            }
        }
    });
}

// Update card colors to match chart colors
function updateCardColors(chartColors) {
    const cards = document.querySelectorAll('.result-card');
    
    // Card 1: Total Balance (Teal) - matches chart.data.datasets[2] (Total Balance)
    if (cards[0]) {
        cards[0].style.background = `${chartColors.balance}20`; // Low opacity background like chart fill
        cards[0].style.borderColor = chartColors.balance;
        cards[0].style.color = chartColors.balance; // Full opacity text
        cards[0].querySelector('h3').style.color = chartColors.balance;
        cards[0].querySelector('p').style.color = chartColors.balance;
    }
    
    // Card 2: Total Invested (Pink/Red) - matches chart.data.datasets[0] (Total Contributions)
    if (cards[1]) {
        cards[1].style.background = `${chartColors.contributions}20`; // Low opacity background like chart fill
        cards[1].style.borderColor = chartColors.contributions;
        cards[1].style.color = chartColors.contributions; // Full opacity text
        cards[1].querySelector('h3').style.color = chartColors.contributions;
        cards[1].querySelector('p').style.color = chartColors.contributions;
    }
    
    // Card 3: Interest Earned (Blue) - matches chart.data.datasets[1] (Total Interest)
    if (cards[2]) {
        cards[2].style.background = `${chartColors.interest}20`; // Low opacity background like chart fill
        cards[2].style.borderColor = chartColors.interest;
        cards[2].style.color = chartColors.interest; // Full opacity text
        cards[2].querySelector('h3').style.color = chartColors.interest;
        cards[2].querySelector('p').style.color = chartColors.interest;
    }
}
