import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { readCSV, searchGoogle } from '../utils/contactInfo';
import { createObjectCsvWriter } from 'csv-writer';

const router = express.Router();

router.get('/contactinfo', async (req, res) =>
{
    try
    {
        // Read the CSV and get debtor names
        const debtorNames = await readCSV("business_data.csv");
        const searchResults: any[] = [];

        // Search for each debtor name
        for (const debtorName of debtorNames)
        {
            const searchQuery = `${debtorName} contact email phone number website`;
            const results = await searchGoogle(searchQuery);
            searchResults.push({
                debtorName,
                results,
            });
        }

        // Create and write to a new CSV file
        const csvWriter = createObjectCsvWriter(
            {
                path: "contact_info.csv",
                header:
                [
                    { id: "debtorName", title: "DebtorName" },
                    { id: "title", title: "Title" },
                    { id: "link", title: "Link" },
                    { id: "snippet", title: "Snippet" },
                    { id: "website", title: "Website" },
                    { id: "phoneNumber", title: "PhoneNumber" },
                    { id: "email", title: "Email" },
                ],
            });

        const formattedResults = searchResults.flatMap(({ debtorName, results }) =>
        results.map((result: any) => {
            // Extract additional information like website, phone number, and email from the snippet or other available data
            const websiteMatch = result.link; // Assuming the link is the website
            const phoneNumberMatch = result.snippet.match(/(\+?\d{1,4}[\s-]?)?(\(?\d{3}\)?[\s-]?)\d{3}[\s-]?\d{4}/); // Regex for phone number
            const emailMatch = result.snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/); // Regex for email

            return {
                debtorName,
                title: result.title,
                link: result.link,
                snippet: result.snippet,
                website: websiteMatch || '',
                phoneNumber: phoneNumberMatch ? phoneNumberMatch[0] : '',
                email: emailMatch ? emailMatch[0] : '',
            };
        })
        );

        await csvWriter.writeRecords(formattedResults);

        // Send the results as a JSON response
        res.status(StatusCodes.OK).json(formattedResults);
    }
    catch (error)
    {
        console.log("Error: ", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
});

export default router;
