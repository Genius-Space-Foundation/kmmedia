/**
 * Report generation and export utilities
 */

export interface ReportData {
  title: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  data: any[];
  summary?: Record<string, any>;
}

/**
 * Export data as CSV
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values with commas or quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data as JSON
 */
export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data as Excel (basic implementation using CSV with .xls extension)
 */
export function exportToExcel(data: any[], filename: string) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);

  // Create tab-separated content for Excel
  const excelContent = [
    headers.join("\t"),
    ...data.map((row) => headers.map((header) => row[header]).join("\t")),
  ].join("\n");

  const blob = new Blob([excelContent], {
    type: "application/vnd.ms-excel",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xls`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate PDF report (basic implementation using window.print)
 */
export function exportToPDF(reportData: ReportData, filename: string) {
  // Create a printable HTML document
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    console.error("Could not open print window");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportData.title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #1f2937;
            margin-bottom: 10px;
          }
          .meta {
            color: #6b7280;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          .summary {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <h1>${reportData.title}</h1>
        <div class="meta">
          <p>Date Range: ${reportData.dateRange.from.toLocaleDateString()} - ${reportData.dateRange.to.toLocaleDateString()}</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
        
        ${
          reportData.summary
            ? `
          <div class="summary">
            <h2>Summary</h2>
            ${Object.entries(reportData.summary)
              .map(
                ([key, value]) => `
              <p><strong>${key}:</strong> ${value}</p>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
        
        <table>
          <thead>
            <tr>
              ${Object.keys(reportData.data[0] || {})
                .map((key) => `<th>${key}</th>`)
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${reportData.data
              .map(
                (row) => `
              <tr>
                ${Object.values(row)
                  .map((value) => `<td>${value}</td>`)
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div style="margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Unified export function that handles all formats
 */
export function exportReport(
  data: any[],
  format: "csv" | "json" | "excel" | "pdf",
  filename: string,
  reportData?: ReportData
) {
  switch (format) {
    case "csv":
      exportToCSV(data, filename);
      break;
    case "json":
      exportToJSON(data, filename);
      break;
    case "excel":
      exportToExcel(data, filename);
      break;
    case "pdf":
      if (reportData) {
        exportToPDF(reportData, filename);
      } else {
        console.error("PDF export requires full report data");
      }
      break;
    default:
      console.error("Unsupported export format");
  }
}
