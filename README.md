# Compound Interest Calculator

A simple web-based compound interest calculator built with HTML, CSS, and JavaScript. This tool helps you visualize the growth of your investment over time with monthly contributions and compounding.

## Features

-   **Initial Principal Amount**: The initial amount of money you invest.
-   **Interest Rate (% Annum)**: The annual percentage at which your investment grows.
-   **Compounding Period**: How often the interest is calculated and added to the balance (Monthly, Quarterly, Half-Yearly, Yearly).
-   **Investment Period**: The number of years you plan to keep your money invested.
-   **Monthly Contribution**: A fixed amount you contribute to your investment each month.
-   **Annual Increase in Monthly Contribution**: The percentage by which your monthly contribution increases each year.
-   **Reinvest Interest**: A checkbox to choose between compound interest (checked) and simple interest (unchecked).
    -   **Compound Interest**: Interest is earned on the current balance and is reinvested.
    -   **Simple Interest**: Interest is earned only on the initial principal amount. This interest is not reinvested and is tracked separately as "Total Encashed Interest".
-   **Chart Visualization**: A line chart that visually represents the growth of the total balance, total contributions, and total interest over the investment period.
-   **Expandable Yearly Breakdown**: The year-by-year results table is now interactive. Click on any year's row to see a detailed monthly breakdown for that year.
-   **Summary Statistics**: A detailed summary including the final balance, total contributions, total interest earned, and a breakdown of whether that interest was compounded or "encashed" (for simple interest).

## How to Use

1.  Open the `index.html` file in your web browser.
2.  Fill in the input fields:
    -   Principal Amount ($)
    -   Interest Rate (% Annum)
    -   Compounding Period
    -   Investment Period (Years)
    -   Monthly Contribution ($)
    -   Annual Increase in Monthly Contribution (%)
3.  Check or uncheck the "Reinvest Interest" box based on your preference.
4.  Click the "Calculate" button.
5.  The summary statistics and a detailed year-by-year breakdown will be displayed below.

## Project Structure

-   `index.html`: The main HTML file containing the structure of the calculator.
-   `css/style.css`: The stylesheet for styling the application.
-   `js/script.js`: The JavaScript file containing the calculation logic and DOM manipulation.
