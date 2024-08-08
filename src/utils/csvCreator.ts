import {createObjectCsvWriter} from "csv-writer";


interface CompanyData
{
    debtors: { name: string; address?: string }[];
    securedPartyName?: string;
    securedPartyAddress?: string;
}

export async function createCsvFile(data: CompanyData[]): Promise<string>
{
    const csvWriter = createObjectCsvWriter(
        {
            path: "business_data.csv",
            header: [
                { id: "debtorName", title: "Debtor Name" },
                { id: "debtorAddress", title: "Debtor Address" },
                { id: "securedPartyName", title: "Secured Party Name" },
                { id: "securedPartyAddress", title: "Secured Party Address" }
            ]
        });

    const records = data.flatMap(company =>
        {
        return company.debtors.map(debtor => ({
            debtorName: debtor.name,
            debtorAddress: debtor.address || '',
            securedPartyName: company.securedPartyName || '',
            securedPartyAddress: company.securedPartyAddress || ''
        }));
    });

    await csvWriter.writeRecords(records);
    console.log("CSV file created");

    return "business_data.csv";
}