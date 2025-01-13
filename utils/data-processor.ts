import Papa from "papaparse";

export async function parseCSV(filePath: string): Promise<any[]> {
  const response = await fetch(filePath);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true, // Treat the first row as headers
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error: Error) => reject(error),
    });
  });
}
