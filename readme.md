# Web Scraper

## Author Irakli Guraspashvili


## Description



## Used Technologies
1. TypeScript
2. Node.js
3. Express.js

## Main Libraries
1. Puppeteer
2. csv-writer
3. Axios

## CSV Files

- `business_data.csv`: Stores all of scraped information from given website. [website](https://bizfileonline.sos.ca.gov/search/ucc).
- `contact_info.csv`: This file will store specific information about debtor names, including additional contact information like emails, phone numbers, and website links.


## Structure of a project

The code of a project is placed in /scr dictionary.

- server.ts - Main file.
- /routes - Route handlers for this project are placed here.
- /utils/buisnessData.ts - Responsible for scraping data from a given website.
- /utils/csvCreator.ts - Responsible for creating csv files based on the scraped information.

## How to run.
1. Docker can be used for running a program.
2. Commands for running the project:

- Install the dependencies
```sh
- npm install
```
- You can use the `dev` script to automatically rebuild and restart the server on file changes:

```sh
npm run dev
```