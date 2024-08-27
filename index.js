const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Path to your token file
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Your OAuth2 client credentials
const credentials = {
    client_id: '### YOUR CLIENT ID ###',
    client_secret: '### YOUR CLIENT SECRET ###',
    redirect_uris: ['http://localhost'],
};
// Create an OAuth2 client
const { client_id, client_secret, redirect_uris } = credentials;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt user input
function promptUser(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Function to get access token
async function getAccessToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const code = await promptUser('Enter the code from that page here: ');

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('Token stored to', TOKEN_PATH);
    await startProcess();
  } catch (err) {
    console.error('Error retrieving access token:', err);
    return getAccessToken(); // Retry if there's an error
  }
}

// Function to delete events within a specific date range
async function deleteEventsInDateRange(auth, calendarId, startTime, endTime, eventsName) {
  const calendar = google.calendar({ version: 'v3', auth });

  let pageToken = null;
  do {
    try {
      const eventsResponse = await calendar.events.list({
        calendarId: calendarId,
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: true,
        orderBy: 'startTime',
        pageToken: pageToken
      });

      const events = eventsResponse.data.items;

      if (events.length) {
        console.log('Found events to delete...');
        for (const event of events) {
          if (eventsName.some(name => event.summary && event.summary.includes(name))) {
            try {
              await calendar.events.delete({
                calendarId: calendarId,
                eventId: event.id,
              });
              console.log(`Event deleted: ${event.summary}`);
            } catch (err) {
              console.error(`Failed to delete event: ${event.summary}`, err);
            }
          }
        }
      } else {
        console.log('No events found in the specified date range.');
      }

      pageToken = eventsResponse.data.nextPageToken;
    } catch (err) {
      console.error('Error retrieving events:', err);
      process.exit(1); // Exit with an error code
    }
  } while (pageToken);
}

// Function to validate date format
function validateDate(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCDate() === day && date.getUTCMonth() === month - 1 && date.getUTCFullYear() === year;
}

// Function to start the process
async function startProcess() {
  try {
    let calendarId;
    while (!calendarId) {
      calendarId = await promptUser('Enter your Calendar ID: ');
      if (!calendarId) {
        console.error('Calendar ID cannot be empty. Please try again.');
      }
    }

    let startDate, endDate;
    do {
      startDate = await promptUser('Enter the start date (dd/mm/yyyy): ');
      if (!validateDate(startDate)) {
        console.error('Invalid start date format. Please use dd/mm/yyyy.');
      }
    } while (!validateDate(startDate));

    do {
      endDate = await promptUser('Enter the end date (dd/mm/yyyy): ');
      if (!validateDate(endDate)) {
        console.error('Invalid end date format. Please use dd/mm/yyyy.');
      }
    } while (!validateDate(endDate));

    // Convert date format to ISO 8601
    const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('/').map(Number);

    const startTime = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0)).toISOString();
    const endTime = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59)).toISOString();

    // Read event names from file
    const eventsNameFilePath = path.join(__dirname, 'eventsName.txt');
    if (!fs.existsSync(eventsNameFilePath)) {
      console.error('File eventsName.txt not found.');
      return startProcess(); // Restart the process if the file is not found
    }

    let eventsName = [];
    try {
      const fileContent = fs.readFileSync(eventsNameFilePath, 'utf8');
      eventsName = JSON.parse(fileContent);
      if (!Array.isArray(eventsName)) {
        throw new Error('Invalid format in eventsName.txt. It should be a JSON array.');
      }
    } catch (err) {
      console.error('Error reading or parsing eventsName.txt:', err);
      return startProcess(); // Restart the process if there's an error
    }

    if (eventsName.length === 0) {
      console.error('No event names found in eventsName.txt.');
      return startProcess(); // Restart the process if no event names are found
    }

    // Read token and start the process
    try {
      const token = fs.readFileSync(TOKEN_PATH, 'utf8');
      if (!token) {
        console.error('Token file is empty.');
        return getAccessToken(); // Retry if the token is empty
      }
      oAuth2Client.setCredentials(JSON.parse(token));
      await deleteEventsInDateRange(oAuth2Client, calendarId, startTime, endTime, eventsName);
      console.log('Process completed successfully.');
      process.exit(0); // Exit with a success code
    } catch (parseError) {
      console.error('Error parsing token JSON:', parseError);
      return getAccessToken(); // Retry if there's a parsing error
    }
  } catch (error) {
    console.error('Error:', error);
    return startProcess(); // Restart the process if there's a general error
  }
}

// Start the process
startProcess();