import express from "express";
import dotenv from "dotenv";
import companyDataRouter from "./routes/buisnessData";
import contactInoRouter from "./routes/contactInfo";
dotenv.config();

const app = express();


// Middleware
app.use(express.json());



app.get("/", (req, res) =>
{
    res.send("This is a web scraper API");
});

app.use("/api", companyDataRouter);
app.use("/api", contactInoRouter);


// not found handler
app.use((req, res) =>
{
    res.status(404).send("Not found");
});

const PORT = process.env.PORT || 5000; 

const start = async () : Promise<void> =>
{
    try
    {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
    }
    catch (error)
    {
        console.error(error);    
    }

}

start();
