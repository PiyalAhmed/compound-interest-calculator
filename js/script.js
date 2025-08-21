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
    
    // Add event listeners for interest strategy changes
    const interestStrategySelect = document.getElementById('interest-strategy-select');
    const encashTimingOptions = document.getElementById('encash-timing-options');
    const encashPercentageRow = document.getElementById('encash-percentage-row');
    const encashPercentageHelp = document.getElementById('encash-percentage-help');
    
    interestStrategySelect.addEventListener('change', function() {
        if (this.value === 'encash') {
            encashTimingOptions.classList.remove('hidden');
            encashPercentageRow.classList.remove('hidden');
            encashPercentageHelp.classList.remove('hidden');
        } else {
            encashTimingOptions.classList.add('hidden');
            encashPercentageRow.classList.add('hidden');
            encashPercentageHelp.classList.add('hidden');
        }
    });
    
    // Add event listeners for encash period changes (month vs year)
    const encashPeriodSelect = document.getElementById('encash-period-select');
    const encashTimingSelect = document.getElementById('encash-timing-select');
    const encashYearInput = document.getElementById('encash-year-input');
    const encashMonthRow = document.getElementById('encash-month-row');
    const encashMonthSelect = document.getElementById('encash-month-select');
    const encashSummaryText = document.getElementById('encash-summary-text');
    
    function updateEncashSummary() {
        const period = encashPeriodSelect.value;
        const timing = encashTimingSelect.value;
        const year = encashYearInput.value;
        const month = encashMonthSelect.options[encashMonthSelect.selectedIndex].text;
        const encashPercentage = parseFloat(document.getElementById('encash-percentage')?.value) || 100;
        
        let summaryText = `Interest will compound until the ${timing} of `;
        
        if (period === 'month') {
            summaryText += `${month} in year ${year}`;
        } else {
            summaryText += `year ${year}`;
        }
        
        if (encashPercentage === 100) {
            summaryText += ', then be encashed monthly.';
        } else {
            summaryText += `, then ${encashPercentage}% will be encashed monthly and ${100 - encashPercentage}% will be reinvested.`;
        }
        
        encashSummaryText.textContent = summaryText;
    }
    
    encashPeriodSelect.addEventListener('change', function() {
        if (this.value === 'month') {
            encashMonthRow.classList.remove('hidden');
        } else {
            encashMonthRow.classList.add('hidden');
        }
        updateEncashSummary();
    });
    
    encashTimingSelect.addEventListener('change', updateEncashSummary);
    encashYearInput.addEventListener('input', updateEncashSummary);
    encashMonthSelect.addEventListener('change', updateEncashSummary);
    
    // Add event listener for encash percentage changes
    const encashPercentageInput = document.getElementById('encash-percentage');
    const encashPercentageNote = document.getElementById('encash-percentage-note');
    
    function updateEncashPercentageNote() {
        const percentage = parseFloat(encashPercentageInput.value) || 100;
        const reinvestPercentage = 100 - percentage;
        
        if (percentage === 100) {
            encashPercentageNote.textContent = "All interest will be encashed.";
        } else {
            encashPercentageNote.textContent = `${percentage}% of interest will be encashed, ${reinvestPercentage}% will be reinvested.`;
        }
    }
    
    encashPercentageInput.addEventListener('input', function() {
        updateEncashSummary();
        updateEncashPercentageNote();
    });
    
    // Initial note update
    updateEncashPercentageNote();
    
    // Initial summary update
    updateEncashSummary();
    
    // Add event listener for additional contribution field
    const additionalContributionField = document.getElementById('additional-contribution');
    const contributionScheduleSection = document.getElementById('contribution-schedule-section');
    const contributionIncreaseSection = document.getElementById('contribution-increase-section');
    const stopContributingSection = document.getElementById('stop-contributing-section');
    
    function updateContributionSections() {
        const contributionAmount = parseFloat(additionalContributionField.value) || 0;
        
        if (contributionAmount > 0) {
            contributionScheduleSection.classList.remove('hidden');
            contributionIncreaseSection.classList.remove('hidden');
            stopContributingSection.classList.remove('hidden');
        } else {
            contributionScheduleSection.classList.add('hidden');
            contributionIncreaseSection.classList.add('hidden');
            stopContributingSection.classList.add('hidden');
        }
    }
    
    // Update sections when contribution amount changes
    additionalContributionField.addEventListener('input', updateContributionSections);
    additionalContributionField.addEventListener('change', updateContributionSections);
    
    // Initial check on page load
    updateContributionSections();
    
    // Add event listeners for stop contribution period changes (month vs year)
    const stopContributingCheckbox = document.getElementById('stop-contributing-checkbox');
    const stopContributingOptions = document.getElementById('stop-contributing-options');
    const stopContributionPeriodSelect = document.getElementById('stop-contribution-period-select');
    const stopContributionTimingSelect = document.getElementById('stop-contribution-timing-select');
    const stopContributionYearInput = document.getElementById('stop-contribution-year-input');
    const stopContributionMonthRow = document.getElementById('stop-contribution-month-row');
    const stopContributionMonthSelect = document.getElementById('stop-contribution-month-select');
    const stopContributionSummaryText = document.getElementById('stop-contribution-summary-text');
    
    function updateStopContributionSummary() {
        const period = stopContributionPeriodSelect.value;
        const timing = stopContributionTimingSelect.value;
        const year = stopContributionYearInput.value;
        const month = stopContributionMonthSelect.options[stopContributionMonthSelect.selectedIndex].text;
        
        let summaryText = `Contributions will continue until the ${timing} of `;
        
        if (period === 'month') {
            summaryText += `${month} in year ${year}`;
        } else {
            summaryText += `year ${year}`;
        }
        
        summaryText += ', then stop. Investment growth continues without new contributions.';
        stopContributionSummaryText.textContent = summaryText;
    }
    
    // Handle checkbox toggle for stop contributing options
    stopContributingCheckbox.addEventListener('change', function() {
        if (this.checked) {
            stopContributingOptions.classList.remove('hidden');
        } else {
            stopContributingOptions.classList.add('hidden');
        }
    });
    
    stopContributionPeriodSelect.addEventListener('change', function() {
        if (this.value === 'month') {
            stopContributionMonthRow.classList.remove('hidden');
        } else {
            stopContributionMonthRow.classList.add('hidden');
        }
        updateStopContributionSummary();
    });
    
    stopContributionTimingSelect.addEventListener('change', updateStopContributionSummary);
    stopContributionYearInput.addEventListener('input', updateStopContributionSummary);
    stopContributionMonthSelect.addEventListener('change', updateStopContributionSummary);
    
    // Initial summary update
    updateStopContributionSummary();
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
    const reinvestInterest = document.getElementById('interest-strategy-select').value === 'reinvest';
    const additionalContribution = parseFloat(document.getElementById('additional-contribution').value) || 0;
    const contributionIncreasePercent = (parseFloat(document.getElementById('contribution-increase').value) || 0) / 100;
    const contributionIncreaseFrequency = parseInt(document.getElementById('contribution-increase-frequency').value) || 1;
    const compoundingPeriodsPerYear = parseInt(document.getElementById('compound-period').value);
    
        // New contribution timing options
    const contributionTiming = document.getElementById('contribution-timing-select').value;
    const contributionFrequency = document.getElementById('contribution-frequency-select').value;
    
    // Stop contribution timing options
    const stopContributingEnabled = document.getElementById('stop-contributing-checkbox')?.checked || false;
    const stopContributionPeriod = document.getElementById('stop-contribution-period-select')?.value || 'year';
    const stopContributionTiming = document.getElementById('stop-contribution-timing-select')?.value || 'start';
    const stopContributionYear = parseInt(document.getElementById('stop-contribution-year-input')?.value) || 1;
    const stopContributionMonth = parseInt(document.getElementById('stop-contribution-month-select')?.value) || 1;
    
    // Encash timing options
    const encashTiming = document.getElementById('encash-timing-select')?.value || 'start';
    const encashPeriod = document.getElementById('encash-period-select')?.value || 'year';
    const encashStartYear = parseInt(document.getElementById('encash-year-input')?.value) || 1;
    const encashStartMonth = parseInt(document.getElementById('encash-month-select')?.value) || 1;
    const encashPercentage = parseFloat(document.getElementById('encash-percentage')?.value) || 100;
    
    // Tax and inflation options
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const taxApplication = document.getElementById('tax-application').value;
    const inflationRate = parseFloat(document.getElementById('inflation-rate').value) || 0;

    if (isNaN(principal) || isNaN(annualInterestRate) || isNaN(years) || isNaN(additionalContribution) || isNaN(contributionIncreasePercent)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    
    // Validate tax and inflation rates
    if (taxRate < 0 || taxRate > 100) {
        alert("Tax rate must be between 0 and 100.");
        return;
    }
    
    if (inflationRate < 0 || inflationRate > 100) {
        alert("Inflation rate must be between 0 and 100.");
        return;
    }

    // Validate compound frequency
    const validFrequencies = [0, 1, 2, 4, 12, 24, 26, 52, 365];
    if (!validFrequencies.includes(compoundingPeriodsPerYear)) {
        alert("Please select a valid compounding frequency.");
        return;
    }

    // Validate encash start timing
    if (!reinvestInterest) {
        if (encashPeriod === 'year') {
            if (encashStartYear < 1 || encashStartYear > years) {
                alert(`Encash start year must be between 1 and ${years} (investment period).`);
                return;
            }
        } else {
            if (encashStartYear < 1 || encashStartYear > years) {
                alert(`Encash start year must be between 1 and ${years} (investment period).`);
                return;
            }
            if (encashStartMonth < 1 || encashStartMonth > 12) {
                alert("Encash start month must be between 1 and 12.");
                return;
            }
        }
        
        // Validate encash percentage
        if (encashPercentage < 1 || encashPercentage > 100) {
            alert("Encash percentage must be between 1 and 100.");
            return;
        }
    }
    
    // Validate stop contribution timing
    if (additionalContribution > 0 && stopContributingEnabled) {
        if (stopContributionPeriod === 'year') {
            if (stopContributionYear < 1 || stopContributionYear > years) {
                alert(`Stop contribution year must be between 1 and ${years} (investment period).`);
                return;
            }
        } else {
            if (stopContributionYear < 1 || stopContributionYear > years) {
                alert(`Stop contribution year must be between 1 and ${years} (investment period).`);
                return;
            }
            if (stopContributionMonth < 1 || stopContributionMonth > 12) {
                alert("Stop contribution month must be between 1 and 12.");
                return;
            }
        }
    }

    // --- 2. INITIALIZE VARIABLES ---
    const totalMonths = years * 12;
    
    // Handle continuous compounding as a special case
    let periodsPerYear;
    if (compoundingPeriodsPerYear === 0) {
        // Continuous compounding: A = P * e^(rt)
        periodsPerYear = 365; // Use daily for calculation purposes, but apply continuous formula
    } else {
        // Discrete compounding: A = P * (1 + r/n)^(nt)
        periodsPerYear = compoundingPeriodsPerYear;
    }
    
    const monthsPerCompoundingPeriod = 12 / periodsPerYear;

    let currentBalance = principal;
    let totalInterestEarned = 0;
    let totalContributions = 0;
    let totalEncashedInterest = 0;
    let interestBucket = 0; // Holds accrued interest before compounding
    let currentAdditionalContribution = additionalContribution;
    
    // Function to calculate current contribution amount based on month and frequency
    function getCurrentContributionAmount(month) {
        if (contributionIncreasePercent === 0) return additionalContribution;
        
        // Calculate how many increase periods have passed
        // The increase should apply AFTER each period, not during the same period
        const monthsPerIncreasePeriod = 12 / contributionIncreaseFrequency;
        const increasePeriodsPassed = Math.floor((month - 1) / monthsPerIncreasePeriod);
        
        if (increasePeriodsPassed > 0) {
            return additionalContribution * Math.pow(1 + contributionIncreasePercent, increasePeriodsPassed);
        }
        return additionalContribution;
    }
    
    // Function to check if we should stop contributing based on month
    function shouldStopContributing(month) {
        if (additionalContribution === 0 || !stopContributingEnabled) return false;
        
        if (stopContributionPeriod === 'year') {
            if (stopContributionTiming === 'start') {
                return month > (stopContributionYear - 1) * 12;
            } else {
                return month > stopContributionYear * 12;
            }
        } else {
            // Month-based stop contributing
            const targetMonth = (stopContributionYear - 1) * 12 + stopContributionMonth;
            if (stopContributionTiming === 'start') {
                return month > targetMonth;
            } else {
                return month > targetMonth;
            }
        }
    }

    const breakdownBody = document.getElementById('breakdown-body');
    breakdownBody.innerHTML = '';

    let yearlyData = { interest: 0, contribution: 0, startingBalance: principal };
    const monthlyBreakdownData = {};
    const chartLabels = ['Start'];
    const balanceData = [principal];
    const totalContributionsData = [0];
    const totalInterestData = [0];
    const totalEncashedData = [0];

    // --- 3. CALCULATION LOOP (MONTH BY MONTH) ---
    for (let month = 1; month <= totalMonths; month++) {
        let monthStartingBalance = currentBalance;
        let contributionThisMonth = 0;
        
        // 3a. Add contribution at start of period if applicable
        if (contributionFrequency === 'month') {
            // Monthly contribution
            if (contributionTiming === 'start') {
                // Check if we should stop contributing
                if (shouldStopContributing(month)) {
                    contributionThisMonth = 0;
                } else {
                    // Add contribution at start of month (before interest calculation)
                    contributionThisMonth = getCurrentContributionAmount(month);
                    currentBalance += contributionThisMonth;
                    totalContributions += contributionThisMonth;
                    yearlyData.contribution += contributionThisMonth;
                    monthStartingBalance = currentBalance; // Update starting balance to include contribution
                }
            }
        } else {
            // Yearly contribution
            if (month % 12 === 1 && contributionTiming === 'start') {
                // Check if we should stop contributing
                if (shouldStopContributing(month)) {
                    contributionThisMonth = 0;
                } else {
                    // Add yearly contribution at start of year
                    contributionThisMonth = getCurrentContributionAmount(month) * 12;
                    currentBalance += contributionThisMonth;
                    totalContributions += contributionThisMonth;
                    yearlyData.contribution += contributionThisMonth;
                    monthStartingBalance = currentBalance; // Update starting balance to include contribution
                }
            }
        }

        // 3b. Calculate interest on the current balance (including start-of-period contributions)
        const baseForInterest = monthStartingBalance + (reinvestInterest ? interestBucket : 0);
        
        let interestThisMonth;
        if (compoundingPeriodsPerYear === 0) {
            // Continuous compounding: calculate monthly interest using continuous formula
            // For monthly calculation: I = P * (e^(r/12) - 1)
            interestThisMonth = baseForInterest * (Math.exp(annualInterestRate / 12) - 1);
        } else {
            // Calculate interest based on compound frequency
            // For monthly calculation, we need to use the effective monthly rate
            // Formula: (1 + r/n)^(n/12) - 1 for monthly interest
            const effectiveMonthlyRate = Math.pow(1 + annualInterestRate / compoundingPeriodsPerYear, compoundingPeriodsPerYear / 12) - 1;
            interestThisMonth = baseForInterest * effectiveMonthlyRate;
        }
        
        interestBucket += interestThisMonth;
        totalInterestEarned += interestThisMonth;
        yearlyData.interest += interestThisMonth;

        // 3c. Add contribution at end of period if applicable
        if (contributionFrequency === 'month') {
            // Monthly contribution
            if (contributionTiming === 'end') {
                // Check if we should stop contributing
                if (shouldStopContributing(month)) {
                    contributionThisMonth = 0;
                } else {
                    // Add contribution at end of month (after interest calculation)
                    contributionThisMonth = getCurrentContributionAmount(month);
                    currentBalance += contributionThisMonth;
                    totalContributions += contributionThisMonth;
                    yearlyData.contribution += contributionThisMonth;
                }
            }
        } else {
            // Yearly contribution
            if (month % 12 === 0 && contributionTiming === 'end') {
                // Check if we should stop contributing
                if (shouldStopContributing(month)) {
                    contributionThisMonth = 0;
                } else {
                    // Add yearly contribution at end of year
                    contributionThisMonth = getCurrentContributionAmount(month) * 12;
                    currentBalance += contributionThisMonth;
                    totalContributions += contributionThisMonth;
                    yearlyData.contribution += contributionThisMonth;
                }
            }
        }

        // 3d. Check if it's the end of a compounding period
        if (month % monthsPerCompoundingPeriod === 0) {
            if (reinvestInterest) {
                currentBalance += interestBucket; // Compound the accrued interest
            } else {
                // Check if we should start encashing interest based on timing
                const currentYear = Math.ceil(month / 12);
                let shouldEncash = false;
                
                if (encashPeriod === 'year') {
                    if (encashTiming === 'start') {
                        // Start encashing from the beginning of the specified year
                        shouldEncash = currentYear >= encashStartYear;
                    } else {
                        // Start encashing from the end of the specified year
                        shouldEncash = currentYear > encashStartYear;
                    }
                } else {
                    // Month-based encashing
                    const targetMonth = (encashStartYear - 1) * 12 + encashStartMonth;
                    if (encashTiming === 'start') {
                        // Start encashing from the beginning of the specified month
                        shouldEncash = month >= targetMonth;
                    } else {
                        // Start encashing from the end of the specified month
                        shouldEncash = month > targetMonth;
                    }
                }
                
                if (shouldEncash) {
                    // Calculate partial encashing based on percentage
                    const encashAmount = interestBucket * (encashPercentage / 100);
                    const reinvestAmount = interestBucket - encashAmount;
                    
                    totalEncashedInterest += encashAmount; // Move portion to encashed total
                    currentBalance += reinvestAmount; // Reinvest the remaining portion
                } else {
                    currentBalance += interestBucket; // Compound the interest until encash starts
                }
            }
            interestBucket = 0; // Reset the bucket
        }

        // 3e. Store monthly data with proper balance calculations
        const yearForMonthlyData = Math.ceil(month / 12);
        if (!monthlyBreakdownData[yearForMonthlyData]) {
            monthlyBreakdownData[yearForMonthlyData] = [];
        }
        
        // Calculate true ending balance including all accumulated interest
        // For encash mode, we need to show the current balance plus any interest that would be encashed
        let trueEndingBalance;
        if (reinvestInterest) {
            trueEndingBalance = currentBalance + interestBucket;
        } else {
            // In encash mode, check if we should show accumulated interest or just current balance
            const currentYear = Math.ceil(month / 12);
            let shouldEncash = false;
            
            if (encashPeriod === 'year') {
                if (encashTiming === 'start') {
                    shouldEncash = currentYear >= encashStartYear;
                } else {
                    shouldEncash = currentYear > encashStartYear;
                }
            } else {
                // Month-based encashing
                const targetMonth = (encashStartYear - 1) * 12 + encashStartMonth;
                if (encashTiming === 'start') {
                    shouldEncash = month >= targetMonth;
                } else {
                    shouldEncash = month > targetMonth;
                }
            }
            
            if (shouldEncash) {
                // Interest is being encashed, so ending balance is just current balance
                trueEndingBalance = currentBalance;
            } else {
                // Interest is still compounding, so include it in the balance
                trueEndingBalance = currentBalance + interestBucket;
            }
        }
        
        // Calculate encashed amount for this month
        let monthlyEncashedAmount = 0;
        if (!reinvestInterest) {
            const currentYear = Math.ceil(month / 12);
            let shouldEncash = false;
            
            if (encashPeriod === 'year') {
                if (encashTiming === 'start') {
                    shouldEncash = currentYear >= encashStartYear;
                } else {
                    shouldEncash = currentYear > encashStartYear;
                }
            } else {
                // Month-based encashing
                const targetMonth = (encashStartYear - 1) * 12 + encashStartMonth;
                if (encashTiming === 'start') {
                    shouldEncash = month >= targetMonth;
                } else {
                    shouldEncash = month > targetMonth;
                }
            }
            
            if (shouldEncash) {
                // Calculate the actual encashed amount based on percentage
                monthlyEncashedAmount = interestThisMonth * (encashPercentage / 100);
            }
        }
        
        monthlyBreakdownData[yearForMonthlyData].push({
            month: month,
            contribution: contributionThisMonth,
            interest: interestThisMonth,
            endingBalance: trueEndingBalance,
            startingBalance: monthStartingBalance,
            encashedAmount: monthlyEncashedAmount
        });

        // 3f. Check for end of year to update table and chart data
        if (month % 12 === 0) {
            const year = month / 12;
            const row = document.createElement('tr');
            row.setAttribute('data-year', year);

            // Calculate ending balance for the table
            let endingBalanceForTable;
            if (reinvestInterest) {
                endingBalanceForTable = currentBalance + interestBucket;
            } else {
                // In encash mode, check if we should show accumulated interest or just current balance
                let shouldEncash = false;
                
                if (encashPeriod === 'year') {
                    if (encashTiming === 'start') {
                        shouldEncash = year >= encashStartYear;
                    } else {
                        shouldEncash = year > encashStartYear;
                    }
                } else {
                    // Month-based encashing - check if we're past the target month
                    const targetMonth = (encashStartYear - 1) * 12 + encashStartMonth;
                    const currentEndMonth = year * 12;
                    if (encashTiming === 'start') {
                        shouldEncash = currentEndMonth >= targetMonth;
                    } else {
                        shouldEncash = currentEndMonth > targetMonth;
                    }
                }
                
                if (shouldEncash) {
                    // Interest is being encashed, so ending balance is just current balance
                    endingBalanceForTable = currentBalance;
                } else {
                    // Interest is still compounding, so include it in the balance
                    endingBalanceForTable = currentBalance + interestBucket;
                }
            }

            // Create row with or without encashed column based on interest strategy
            let rowHTML = `
                <td>${year}</td>
                <td>${formatMoney(yearlyData.startingBalance)}</td>
                <td>${formatMoney(yearlyData.interest)}</td>
            `;
            
            // Add contributions column only if there are additional contributions
            if (additionalContribution > 0) {
                rowHTML += `<td>${formatMoney(yearlyData.contribution)}</td>`;
            }
            
            rowHTML += `<td>${formatMoney(endingBalanceForTable)}</td>`;
            
            if (!reinvestInterest) {
                // Calculate yearly encashed amount
                let yearlyEncashedAmount = 0;
                if (monthlyBreakdownData[year]) {
                    yearlyEncashedAmount = monthlyBreakdownData[year].reduce((sum, monthData) => sum + monthData.encashedAmount, 0);
                }
                rowHTML += `<td>${formatMoney(yearlyEncashedAmount)}</td>`;
            }
            
            row.innerHTML = rowHTML;
            breakdownBody.appendChild(row);

            yearlyData.startingBalance = endingBalanceForTable;
            yearlyData.interest = 0;
            yearlyData.contribution = 0;
            


            chartLabels.push(`Year ${year}`);
            balanceData.push(endingBalanceForTable);
            totalContributionsData.push(totalContributions);
            totalInterestData.push(totalInterestEarned);
            totalEncashedData.push(totalEncashedInterest);
        }
    }

    // --- 3g. HANDLE LEFTOVER INTEREST (Edge case fix) ---
    // If there's remaining interest in the bucket at the end, process it
    if (interestBucket > 0) {
        if (reinvestInterest) {
            currentBalance += interestBucket;
        } else {
            // Calculate partial encashing for remaining interest
            const encashAmount = interestBucket * (encashPercentage / 100);
            const reinvestAmount = interestBucket - encashAmount;
            
            totalEncashedInterest += encashAmount; // Move portion to encashed total
            currentBalance += reinvestAmount; // Reinvest the remaining portion
        }
        interestBucket = 0;
    }

    // --- 4. DISPLAY RESULTS ---
    const totalInvested = principal + totalContributions;
    
    // Calculate final balance based on interest strategy
    let finalBalance;
    if (reinvestInterest) {
        finalBalance = currentBalance + interestBucket;
    } else {
        // In encash mode, check if we should include accumulated interest in final balance
        let shouldEncash = false;
        
        if (encashPeriod === 'year') {
            if (encashTiming === 'start') {
                shouldEncash = years >= encashStartYear;
            } else {
                shouldEncash = years > encashStartYear;
            }
        } else {
            // Month-based encashing
            const targetMonth = (encashStartYear - 1) * 12 + encashStartMonth;
            const totalMonthsEnd = years * 12;
            if (encashTiming === 'start') {
                shouldEncash = totalMonthsEnd >= targetMonth;
            } else {
                shouldEncash = totalMonthsEnd > targetMonth;
            }
        }
        
        if (shouldEncash) {
            // Interest is being encashed, so final balance is just current balance
            finalBalance = currentBalance;
        } else {
            // Interest is still compounding, so include it in the final balance
            finalBalance = currentBalance + interestBucket;
        }
    }

    // Debug logging for encash mode
    if (!reinvestInterest) {
        console.log('Encash Mode Debug:');
        console.log('Principal:', principal);
        console.log('Total Contributions:', totalContributions);
        console.log('Current Balance (Principal + Contributions):', currentBalance);
        console.log('Total Interest Earned (Encashed):', totalInterestEarned);
        console.log('Final Balance (Principal + Contributions):', finalBalance);
    }

    document.getElementById('total-balance').textContent = formatMoney(finalBalance);
    document.getElementById('total-invested').textContent = formatMoney(totalInvested);
    document.getElementById('total-interest').textContent = formatMoney(totalInterestEarned);

    // Show/hide encashed amount card and column header based on interest strategy
    const encashedAmountCard = document.getElementById('encashed-amount-card');
    const encashedColumnHeader = document.getElementById('encashed-column-header');
    
    if (!reinvestInterest) {
        // Show encashed amount card and update the value
        document.getElementById('total-encashed').textContent = formatMoney(totalEncashedInterest);
        encashedAmountCard.classList.remove('hidden');
        encashedColumnHeader.classList.remove('hidden');
    } else {
        // Hide encashed amount card and column header
        encashedAmountCard.classList.add('hidden');
        encashedColumnHeader.classList.add('hidden');
    }
    
    // Show/hide contributions column based on whether there are additional contributions
    const contributionsColumnHeader = document.getElementById('contributions-column-header');
    if (additionalContribution > 0) {
        contributionsColumnHeader.classList.remove('hidden');
    } else {
        contributionsColumnHeader.classList.add('hidden');
    }
    
    // Calculate and show tax and inflation results
    const taxCard = document.getElementById('tax-card');
    const inflationCard = document.getElementById('inflation-card');
    
    if (taxRate > 0 || inflationRate > 0) {
        // Calculate final balance after tax
        let balanceAfterTax = finalBalance;
        if (taxRate > 0) {
            if (taxApplication === 'interest') {
                // Tax on interest only (more realistic)
                const taxableAmount = totalInterestEarned + totalEncashedInterest;
                const taxOwed = taxableAmount * (taxRate / 100);
                balanceAfterTax = finalBalance - taxOwed;
            } else {
                // Tax on whole amount
                balanceAfterTax = finalBalance * (1 - taxRate / 100);
            }
            document.getElementById('balance-after-tax').textContent = formatMoney(balanceAfterTax);
            taxCard.classList.remove('hidden');
        } else {
            taxCard.classList.add('hidden');
        }
        
        // Calculate final balance after tax and inflation
        if (inflationRate > 0) {
            const balanceAfterInflation = balanceAfterTax * Math.pow(1 - inflationRate / 100, years);
            document.getElementById('balance-after-inflation').textContent = formatMoney(balanceAfterInflation);
            
            // Update the inflation card title based on whether tax is applied
            const inflationCardTitle = inflationCard.querySelector('h3');
            if (taxRate > 0) {
                inflationCardTitle.textContent = 'Final Balance After Tax & Inflation';
            } else {
                inflationCardTitle.textContent = 'Final Balance After Inflation';
            }
            
            inflationCard.classList.remove('hidden');
        } else {
            inflationCard.classList.add('hidden');
        }
    } else {
        // Hide both cards if no tax or inflation
        taxCard.classList.add('hidden');
        inflationCard.classList.add('hidden');
    }

    document.getElementById('result').classList.remove('hidden');
    showResults(); // Show results and hide initial state
    renderChart(chartLabels, balanceData, totalContributionsData, totalInterestData, totalEncashedData, reinvestInterest);
    addTableExpandListener(monthlyBreakdownData, reinvestInterest, additionalContribution);
}

function addTableExpandListener(monthlyData, reinvestInterest, additionalContribution) {
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
        
        // Create header with or without encashed column based on interest strategy
        let headerHTML = `
            <th>Month</th>
            <th>Starting Balance</th>
            <th>Interest Earned</th>
        `;
        
        // Add contributions column only if there are additional contributions
        if (additionalContribution > 0) {
            headerHTML += `<th>Contribution</th>`;
        }
        
        headerHTML += `<th>Ending Balance</th>`;
        
        if (!reinvestInterest) {
            headerHTML += `<th>Encashed Amount</th>`;
        }
        
        headerRow.innerHTML = headerHTML;
        fragment.appendChild(headerRow);

        yearData.forEach((data, index) => {
            const monthlyRow = document.createElement('tr');
            monthlyRow.classList.add('monthly-row', `monthly-row-for-year-${year}`);

                    // Create row with or without encashed column based on interest strategy
        let rowHTML = `
            <td>${data.month}</td>
            <td>${formatMoney(data.startingBalance)}</td>
            <td>${formatMoney(data.interest)}</td>
        `;
        
        // Add contributions column only if there are additional contributions
        if (additionalContribution > 0) {
            rowHTML += `<td>${formatMoney(data.contribution)}</td>`;
        }
        
        rowHTML += `<td>${formatMoney(data.endingBalance)}</td>`;
        
        if (!reinvestInterest) {
            rowHTML += `<td>${formatMoney(data.encashedAmount)}</td>`;
        }
        
        monthlyRow.innerHTML = rowHTML;
            fragment.appendChild(monthlyRow);
        });

        row.after(fragment);
    });
}

let investmentChart = null;

function renderChart(labels, balanceData, contributionsData, interestData, encashedData, reinvestInterest) {
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
        balance: '#4bc0c0',       // Teal - matches card 3
        encashed: '#4caf50',      // Green - matches encashed amount card
        tax: '#ff5722',           // Red-Orange - matches tax card
        inflation: '#9c27b0'      // Purple - matches inflation card
    };
    
    // Update card colors to match chart colors
    updateCardColors(chartColors);

    // Create datasets array
    const datasets = [
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
    ];

    // Add encashed amount dataset only when encash mode is selected
    if (!reinvestInterest) {
        datasets.push({
            label: 'Total Encashed Amount',
            data: encashedData,
            borderColor: chartColors.encashed,
            backgroundColor: chartColors.encashed + '20',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: chartColors.encashed,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3
        });
    }

    investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            // Mobile-specific optimizations
            devicePixelRatio: window.devicePixelRatio || 1,
            onResize: function(chart, size) {
                // Adjust font sizes for mobile
                const isMobile = window.innerWidth <= 768;
                const isSmallMobile = window.innerWidth <= 480;
                
                if (isSmallMobile) {
                    if (chart.options.plugins && chart.options.plugins.title) {
                        chart.options.plugins.title.font.size = 14;
                    }
                    if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                        chart.options.plugins.legend.labels.font.size = 11;
                    }
                } else if (isMobile) {
                    if (chart.options.plugins && chart.options.plugins.title) {
                        chart.options.plugins.title.font.size = 16;
                    }
                    if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                        chart.options.plugins.legend.labels.font.size = 12;
                    }
                }
            },
            plugins: {
                // Custom plugin to force y-axis configuration
                customYAxis: {
                    id: 'customYAxis',
                    afterInit: function(chart) {
                        console.log('🔧 Custom plugin: Forcing y-axis configuration');
                        // Force our tick configuration
                        chart.options.scales.y.ticks.autoSkip = false;
                        chart.options.scales.y.ticks.maxTicksLimit = 8;
                        
                        // Ensure our values function is used
                        chart.options.scales.y.ticks.values = function(context) {
                            const max = yAxisMax;
                            const step = max / 7;
                            const ticks = [];
                            
                            for (let i = 0; i <= 7; i++) {
                                ticks.push(Math.round(step * i * 100) / 100);
                            }
                            
                            console.log('🔧 Plugin: Y-axis ticks generated:', ticks);
                            return ticks;
                        };
                        
                        chart.update('none');
                    }
                },
                title: {
                    display: true,
                    text: 'Investment Growth Over Time',
                    font: {
                        size: window.innerWidth <= 480 ? 14 : (window.innerWidth <= 768 ? 16 : 18),
                        weight: '600'
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: window.innerWidth <= 480 ? 11 : (window.innerWidth <= 768 ? 12 : 14)
                        }
                    }
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
                            size: window.innerWidth <= 480 ? 12 : (window.innerWidth <= 768 ? 13 : 14),
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    },
                    // Force consistent y-axis behavior across all devices
                    beginAtZero: true,
                    suggestedMax: yAxisMax,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    ticks: {
                        // Generate consistent y-axis ticks across all devices
                        callback: function(value, index, values) {
                            return formatMoney(value);
                        },
                        // Force consistent tick generation - same logic as desktop
                        values: function(context) {
                            const max = yAxisMax;
                            
                            // Use the same calculation logic as desktop
                            // Generate ticks that match the desktop behavior
                            const step = max / 7; // 8 points (0 to 7)
                            const ticks = [];
                            
                            for (let i = 0; i <= 7; i++) {
                                ticks.push(Math.round(step * i * 100) / 100);
                            }
                            
                            console.log('🔧 Y-axis ticks generated:', ticks, 'Screen width:', window.innerWidth, 'Max value:', max, 'Step:', step);
                            return ticks;
                        },
                        autoSkip: false,
                        maxTicksLimit: 8, // Force exactly 8 ticks
                        font: {
                            size: window.innerWidth <= 480 ? 10 : (window.innerWidth <= 768 ? 11 : 12)
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
                padding: (function() {
                    const isMobile = window.innerWidth <= 768;
                    const isSmallMobile = window.innerWidth <= 480;
                    
                    if (isSmallMobile) {
                        return {
                            top: 12,
                            right: 15,
                            bottom: 12,
                            left: 20
                        };
                    } else if (isMobile) {
                        return {
                            top: 15,
                            right: 20,
                            bottom: 15,
                            left: 25
                        };
                    } else {
                        return {
                            top: 30,
                            right: 30,
                            bottom: 30,
                            left: 50
                        };
                    }
                })()
            }
        }
    });
    
    // Force y-axis configuration immediately after chart creation
    if (investmentChart) {
        // Ensure our tick configuration is applied
        investmentChart.options.scales.y.ticks.autoSkip = false;
        investmentChart.options.scales.y.ticks.maxTicksLimit = 8;
        
        // Force the chart to use our custom values function
        investmentChart.options.scales.y.ticks.values = function(context) {
            const max = yAxisMax;
            const step = max / 7; // 8 points (0 to 7)
            const ticks = [];
            
            for (let i = 0; i <= 7; i++) {
                ticks.push(Math.round(step * i * 100) / 100);
            }
            
            return ticks;
        };
        
        // Force update to apply our configuration
        investmentChart.update('none');
    }
    
    // Add resize listener for mobile optimization
    const handleResize = () => {
        if (investmentChart) {
            // Force chart to use our custom tick configuration
            investmentChart.options.scales.y.ticks.values = function(context) {
                const max = yAxisMax;
                const step = max / 7; // 8 points (0 to 7)
                const ticks = [];
                
                for (let i = 0; i <= 7; i++) {
                    ticks.push(Math.round(step * i * 100) / 100);
                }
                
                return ticks;
            };
            
            // Force the chart to respect our tick configuration
            investmentChart.options.scales.y.ticks.autoSkip = false;
            investmentChart.options.scales.y.ticks.maxTicksLimit = 8;
            
            investmentChart.resize();
            investmentChart.update('none'); // Force update without animation
        }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial mobile optimization and force tick configuration
    if (window.innerWidth <= 768) {
        handleResize();
    }
    
    // Force initial tick configuration for all devices
    setTimeout(() => {
        if (investmentChart) {
            handleResize();
        }
    }, 100);
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
    
    // Card 2: Total Invested (Orange) - matches chart.data.datasets[0] (Total Contributions)
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
    
    // Card 4: Total Encashed Amount (Green) - matches chart.data.datasets[3] (Total Encashed Amount)
    const encashedCard = document.getElementById('encashed-amount-card');
    if (encashedCard && !encashedCard.classList.contains('hidden')) {
        encashedCard.style.background = `${chartColors.encashed}20`; // Low opacity background like chart fill
        encashedCard.style.borderColor = chartColors.encashed;
        encashedCard.style.color = chartColors.encashed; // Full opacity text
        encashedCard.querySelector('h3').style.color = chartColors.encashed;
        encashedCard.querySelector('p').style.color = chartColors.encashed;
    }
    
    // Card 5: Final Balance After Tax (Red-Orange) - matches tax card
    const taxCard = document.getElementById('tax-card');
    if (taxCard && !taxCard.classList.contains('hidden')) {
        taxCard.style.background = `${chartColors.tax}20`; // Low opacity background like chart fill
        taxCard.style.borderColor = chartColors.tax;
        taxCard.style.color = chartColors.tax; // Full opacity text
        taxCard.querySelector('h3').style.color = chartColors.tax;
        taxCard.querySelector('p').style.color = chartColors.tax;
    }
    
    // Card 6: Final Balance After Tax & Inflation (Purple) - matches inflation card
    const inflationCard = document.getElementById('inflation-card');
    if (inflationCard && !inflationCard.classList.contains('hidden')) {
        inflationCard.style.background = `${chartColors.inflation}20`; // Low opacity background like chart fill
        inflationCard.style.borderColor = chartColors.inflation;
        inflationCard.style.color = chartColors.inflation; // Full opacity text
        inflationCard.querySelector('h3').style.color = chartColors.inflation;
        inflationCard.querySelector('p').style.color = chartColors.inflation;
    }
}

// Show initial state when page loads
document.addEventListener('DOMContentLoaded', function() {
    showInitialState();
});

// Function to show initial state
function showInitialState() {
    const resultDiv = document.getElementById('result');
    const initialStateDiv = document.getElementById('initial-state');
    
    if (resultDiv && initialStateDiv) {
        resultDiv.classList.add('hidden');
        initialStateDiv.classList.remove('hidden');
    }
}

// Function to show results
function showResults() {
    const resultDiv = document.getElementById('result');
    const initialStateDiv = document.getElementById('initial-state');
    
    if (resultDiv && initialStateDiv) {
        resultDiv.classList.remove('hidden');
        initialStateDiv.classList.add('hidden');
    }
}

// Function to adjust results section height to match calculator section
function adjustResultsHeight() {
    const calculatorInputs = document.querySelector('.calculator-inputs');
    const calculatorResults = document.querySelector('.calculator-results');
    
    if (calculatorInputs && calculatorResults) {
        const calculatorHeight = calculatorInputs.offsetHeight;
        calculatorResults.style.height = calculatorHeight + 'px';
        calculatorResults.style.overflowY = 'auto';
        calculatorResults.style.overflowX = 'hidden';
    }
}

// Adjust height on page load
document.addEventListener('DOMContentLoaded', function() {
    adjustResultsHeight();
    
    // Adjust height when window resizes
    window.addEventListener('resize', adjustResultsHeight);
    
    // Adjust height when form elements change (for dynamic content)
    const formElements = document.querySelectorAll('#calculator-form input, #calculator-form select');
    formElements.forEach(element => {
        element.addEventListener('change', adjustResultsHeight);
        element.addEventListener('input', adjustResultsHeight);
    });
    
    // Additional event listeners for elements that can dynamically show/hide content
    const additionalContribution = document.getElementById('additional-contribution');
    if (additionalContribution) {
        additionalContribution.addEventListener('input', adjustResultsHeight);
        additionalContribution.addEventListener('change', adjustResultsHeight);
    }
    
    // Monitor checkbox changes that can show/hide form sections
    const checkboxes = document.querySelectorAll('#calculator-form input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', adjustResultsHeight);
    });
    
    // Monitor select changes that can show/hide form sections
    const selects = document.querySelectorAll('#calculator-form select');
    selects.forEach(select => {
        select.addEventListener('change', adjustResultsHeight);
    });
    
    // Use MutationObserver to detect DOM changes that might affect height
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                // Small delay to ensure DOM has updated
                setTimeout(adjustResultsHeight, 10);
            }
        });
    });
    
    // Observe the calculator form for any DOM changes
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {
        observer.observe(calculatorForm, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }
});
