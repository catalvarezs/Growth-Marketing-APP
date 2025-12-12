# Growth Marketing APP

**Turn your spreadsheets into actionable growth insights instantly.**

The **Growth Marketing APP** is an AI-powered analytics interface designed specifically for Growth Engineers, Marketing Managers, and Data Analysts. It bridges the gap between raw Excel/Google Sheets data and strategic decision-making by allowing you to chat with your data using natural language.

## Built for Growth & Marketing

Unlike generic data tools, this application is contextually aware of marketing terminologies and KPIs. It is pre-programmed to understand and calculate key growth metrics without complex SQL queries or pivot tables.

### Key Marketing Capabilities:

*   **Instant KPI Calculation**: automatically detects relevant columns (e.g., "Spend", "Revenue", "Customers") to calculate:
    *   **CAC (Customer Acquisition Cost)**: `Total Spend / New Customers`
    *   **ROAS (Return on Ad Spend)**: `Revenue / Spend`
    *   **AOV (Average Order Value)**: `Revenue / Orders`
*   **Trend Analysis**: Ask questions like *"How has my CPA evolved over the last 3 months?"* or *"Compare Facebook Ads vs. Google Ads performance."*
*   **Automated Visualization**: The AI autonomously decides when to generate charts. If you ask for a trend, it generates a **Line Chart**. If you ask for a channel breakdown, it generates a **Bar or Pie Chart**.
*   **Cross-Sheet Intelligence**: It can analyze data across multiple sheets (e.g., cross-referencing a "Spend" sheet with a "CRM/Sales" sheet).

## Features

*   **Dual Data Ingestion**:
    *   **Google Sheets**: Connect directly via a public or shared link.
    *   **Excel Upload**: Drag and drop local `.xlsx` or `.xls` files.
*   **AI-Powered Chat**: Utilizes **Google Gemini 2.5 Flash** for high-speed, accurate reasoning over tabular data.
*   **Data Privacy**: Your data is processed in the browser and sent securely to the LLM for analysis.
*   **Minimalist Design**: A clean, monochrome interface (inspired by Cal.com) that focuses strictly on the data.
*   **Interactive Data Table**: View and verify the raw data within the app before analyzing it.

## Tech Stack

*   **Frontend**: React 19, Tailwind CSS
*   **AI Model**: Google Gemini API (`@google/genai`)
*   **Visualization**: Recharts
*   **Data Parsing**: SheetJS (`xlsx`)
*   **Icons**: Lucide React

## Example Prompts

Try asking these questions to your data:

1.  *"What is the overall ROAS for Q1?"*
2.  *"Plot the monthly revenue trend."*
3.  *"Which marketing channel has the lowest CAC?"*
4.  *"Visualize the spend distribution by platform as a pie chart."*
5.  *"Summarize the top 3 best-performing campaigns."*
