import axios from "axios";
import csv from "csv-parser";
import fs from "fs";

const searchGoogle = async (query: string) =>
{
    // in other cases, this would be stored in a .env file
    const apiKey = "AIzaSyBV-8DCH2YV-Fe1XGYuhwy-IQNiEB-sDzg";
    const cx = "a60f8c215093f4440";
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

    try
    {
        const response = await axios.get(url);
        return response.data.items;
    }
    catch (error)
    {
        console.error("Error making API request", error);
        return [];
    }
};


// Function to read CSV and return debtor names
const readCSV = async (filePath: string): Promise<string[]> =>
{
    const debtorNames: string[] = [];
  
    return new Promise((resolve, reject) =>
    {
        fs.createReadStream(filePath)
            .pipe(csv())// csv() is a function that returns a stream.Transform object
            .on('data', (row) =>
            {
                const debtorName = row["Debtor Name"];
                if (debtorName)
                {
                    debtorNames.push(debtorName);
                }
            })
            .on('end', () =>
            {
                resolve(debtorNames);
            })
            .on('error', (error) =>
            {
                reject(error);
            });
    });
  };

export { searchGoogle, readCSV};