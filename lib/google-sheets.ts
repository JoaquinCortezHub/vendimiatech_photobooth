// TODO: Re-enable spreadsheet registration
// import { google } from "googleapis";
//
// export async function appendRegistration(name: string, handle: string) {
//   const auth = new google.auth.GoogleAuth({
//     credentials: {
//       client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
//       private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//     },
//     scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//   });
//
//   const sheets = google.sheets({ version: "v4", auth });
//
//   await sheets.spreadsheets.values.append({
//     spreadsheetId: process.env.GOOGLE_SHEETS_ID,
//     range: "Sheet1!A:C",
//     valueInputOption: "USER_ENTERED",
//     requestBody: {
//       values: [[name, handle, new Date().toISOString()]],
//     },
//   });
// }
