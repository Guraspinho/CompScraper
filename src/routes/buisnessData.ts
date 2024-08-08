import express from "express";
import { StatusCodes } from "http-status-codes";
import { scrapeBuisnessData } from "../utils/buisnessData";
import { createCsvFile } from "../utils/csvCreator";
import path from 'path';

const router = express.Router();


router.get("/companydata", async (req, res) =>
{
    try
    {
        // Get the search query from the request query string
        const searchQuery = req.query.search as string;

        if(!searchQuery)
        {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Please provide a search query" });
        }

        const data = await scrapeBuisnessData(searchQuery);

        // handler for no data found
        if (data.length === 0)
        {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No data found" });
        }


        // Create CSV file
        const csvFilePath = await createCsvFile(data);



        res.status(StatusCodes.OK).json({message: "Information successfully scraped and saved to CSV file", csvFilePath: path.resolve(csvFilePath)});
    }
    catch (error)
    {
        console.log("Error: ",error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
    
});

export default router;