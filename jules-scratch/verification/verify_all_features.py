import os
from playwright.sync_api import sync_playwright, Page, expect

def verify_all_features():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Set a larger viewport to see the layout
        page.set_viewport_size({"width": 1280, "height": 1024})

        file_path = os.path.abspath('index.html')
        page.goto(f'file://{file_path}')

        # Fill out the form
        page.fill('#principal', '5000')
        page.fill('#interest-rate', '7')
        page.select_option('#compound-period', value="12") # Monthly
        page.fill('#years', '3')
        page.fill('#monthly-contribution', '200')
        page.fill('#contribution-increase', '5')
        page.check('#reinvest-interest')

        # Click the calculate button
        page.click('button[type="submit"]')

        # Click the calculate button and wait for the results container to be visible
        expect(page.locator('#result')).to_be_visible()

        # Take screenshot 1: Initial results with chart
        page.screenshot(path='jules-scratch/verification/final_verification_1_chart.png')

        # Find and click the row for Year 2
        year_2_row = page.locator('tr[data-year="2"]')
        expect(year_2_row).to_be_visible()
        year_2_row.click()

        # Wait for the monthly rows to appear
        monthly_header = page.locator('.monthly-row th:has-text("Month")')
        expect(monthly_header).to_be_visible()

        # Take screenshot 2: Expanded table
        page.screenshot(path='jules-scratch/verification/final_verification_2_expanded.png')

        browser.close()

if __name__ == "__main__":
    verify_all_features()
