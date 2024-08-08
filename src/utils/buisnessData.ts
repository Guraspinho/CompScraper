import puppeteer from 'puppeteer';

interface BusinessData
{
    label: string;
    value: string;
}

interface CompanyData
{
    debtors: { name: string; address?: string }[];
    securedPartyName?: string;
    securedPartyAddress?: string;
}

// This is a function that scrapes the California Secretary of State website for business data
export async function scrapeBuisnessData(keyword: string): Promise<CompanyData[]>
{
    // Launch a new browser instance
    const browser = await puppeteer.launch(
    {
        // headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    // await page.setViewport({ width: 1080, height: 1024 });

    // Setting a common user-agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');

    // Array to hold all business data
    let allCompanyData: CompanyData[] = [];
    try
    {
        // Navigate to the business search page
        await page.goto("https://bizfileonline.sos.ca.gov/search/ucc",
        {
            waitUntil: "networkidle2",
        });

        const searchInputSelector = 'input.search-input[placeholder="Search by name or file number"]';
        await page.waitForSelector(searchInputSelector, { timeout: 10000 });
        await page.click(searchInputSelector);
        await page.keyboard.type(keyword);

        // Click on the Advanced filtering button
        await page.click('button.advanced-search-toggle');

        // ***************** select start date *****************

        // Wait for the button to be available in the DOM
        await page.waitForSelector('button.btn.btn-primary.btn-raised.picker-button');

        // Click on the button
        await page.click('button.btn.btn-primary.btn-raised.picker-button');

        // Select "July" as the month.
        await page.evaluate(() =>
        {
            // Find the select element for the month
            const selectElement = document.querySelector('select.react-datepicker__month-select') as HTMLSelectElement;
            if (selectElement)
            {
                // Change the selected option
                selectElement.value = '6'; // Value for "July"

                // Dispatch a change event to ensure the selection is recognized
                const event = new Event('change', { bubbles: true });
                selectElement.dispatchEvent(event);
            }
        });

        // Wait for the date picker to update and the day element to be available
        await page.waitForSelector('div.react-datepicker__day.react-datepicker__day--001');

        // Click on the specific day (e.g., "1" for July 1st)
        await page.click('div.react-datepicker__day.react-datepicker__day--001');

        // the end date is set to the current date by default.

        // ***************** click search button *****************

        // Wait for the search button to be available
        await page.waitForSelector('button.btn.btn-primary.btn-raised.advanced-search-button');

        // Scroll the button into view
        await page.evaluate(() =>
        {
            document.querySelector('button.btn.btn-primary.btn-raised.advanced-search-button')?.scrollIntoView();
        });

        // Add a small delay to mimics human interaction and click 
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.click('button.btn.btn-primary.btn-raised.advanced-search-button');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ***************** iterate over all results *****************

        let hasMoreResults = true;

        while (hasMoreResults)
        {
            // Retrieve all rows from the table of companies
            const rows = await page.$$("tbody.div-table-body > tr");

            for (let i = 1; i < rows.length; i++)
            {
                // Check if the row has a value of debtor information (the ones that don't contain that information are not needed)
                const cellValue = await rows[i].evaluate(row =>
                {
                    const cell = row.querySelector('td:nth-child(2) span.cell');
                    return cell ? cell.textContent?.trim() : null;
                });

                // if the cellValue is not null, click on the button
                if (cellValue)
                {
                    // Click on the button within each row
                    const button = await rows[i].$('div.interactive-cell-button');
                    if (button)
                    {
                        await button.click();
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Wait for the drawer to open and data to be available
                        await page.waitForSelector('div.drawer.show .inner-drawer tr.detail', { timeout: 10000 });

                        // Extract business information
                        const businessData = await page.evaluate(() =>
                        {
                            const rows = Array.from(document.querySelectorAll('div.drawer.show .inner-drawer tr.detail'));
                            const data: { label: string; value: string }[] = [];
                            rows.forEach((row) =>
                            {
                                const label = row.querySelector('td.label')?.textContent?.trim();
                                const value = row.querySelector('td.value')?.textContent?.trim();
                                if (label && value)
                                {
                                    data.push({ label, value });
                                }
                            });
                            return data;
                        });

                        // Extract the relevant data
                        let companyData: CompanyData = { debtors: [] };
                        businessData.forEach(item =>
                        {
                            // Check the label and assign the value to the appropriate field
                            switch (item.label)
                            {
                                case "Debtor Name":
                                    companyData.debtors.push({ name: item.value });
                                    break;
                                case "Debtor Address":
                                    if (companyData.debtors.length > 0)
                                    {
                                        companyData.debtors[companyData.debtors.length - 1].address = item.value;
                                    }
                                    break;
                                case "Secured Party Name":
                                    companyData.securedPartyName = item.value;
                                    break;
                                case "Secured Party Address":
                                    companyData.securedPartyAddress = item.value;
                                    break;
                            }
                        });

                        // Push the current company's data to the array
                        allCompanyData.push(companyData);

                        // Close the drawer
                        await page.click('button.close-button');
                        console.log('Company data:', companyData);

                        // Wait a bit before proceeding to the next item to avoid being blocked
                        await new Promise((resolve) => setTimeout(resolve, 500));
                    }
                }
            }

            // Scroll down to load more results
            const previousHeight: number = await page.evaluate('document.body.scrollHeight') as number;
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for new results to load
            const newHeight = await page.evaluate('document.body.scrollHeight') as number;

            // Check if the scroll has reached the end
            hasMoreResults = newHeight > previousHeight;
        }

        return allCompanyData;

    }
    catch (error)
    {
        // the process will stop at some point and the error will be logged
        console.error('Error occurred:', error);
    }
    finally
    {
        console.log('Closing browser...');
        await browser.close();
        return allCompanyData;
    }
}
