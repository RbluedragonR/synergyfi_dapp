import Papa from 'papaparse';
export function downloadCSV(array: object[], filename: string): void {
  const csv = Papa.unparse(array);

  const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  let csvURL = null;
  csvURL = window.URL.createObjectURL(csvData);
  const tempLink = document.createElement('a');
  tempLink.href = csvURL;
  tempLink.setAttribute('download', filename);
  tempLink.click();
}
