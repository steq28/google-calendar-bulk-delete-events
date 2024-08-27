![Untitled-1](https://github.com/user-attachments/assets/39be62f9-4aef-4ef3-a5c3-7291195f6f5f)
# Google Calendar Bulk Delete Events

This script allows you to delete events from your Google Calendar within a specified date range, based on event names listed in a text file (`eventsName.txt`). The script interacts with the Google Calendar API and requires OAuth 2.0 credentials for access.

## Table of Contents

- [Google Calendar Bulk Delete Events](#google-calendar-bulk-delete-events)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Creating OAuth Credentials](#creating-oauth-credentials)
    - [Steps:](#steps)
  - [Setting Up the `eventsName.txt` File](#setting-up-the-eventsnametxt-file)
  - [Running the Script](#running-the-script)
  - [Error Handling and User Prompts](#error-handling-and-user-prompts)
  - [License](#license)

## Prerequisites

Before you start, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v12.0.0 or higher)
- npm (comes with Node.js)
- A Google account with access to the Google Calendar you want to modify

## Installation

1. **Clone the repository or download the script:**

   ```bash
   git clone https://github.com/steq28/google-calendar-bulk-delete-events.git
   cd google-calendar-bulk-delete-events
   ```

2. **Install dependencies:**

   In the project directory, run:

   ```bash
   npm install
   ```

3. **Prepare OAuth credentials:**

   Follow the instructions in the [Creating OAuth Credentials](#creating-oauth-credentials) section to set up your OAuth 2.0 credentials.

4. **Create the `token.json` file:**

   The script will guide you through this process the first time you run it if the file does not already exist.

## Creating OAuth Credentials

To access the Google Calendar API, you need to create OAuth 2.0 credentials in the Google Cloud Console.

### Steps:

1. **Go to the [Google Cloud Console](https://console.cloud.google.com/).**

2. **Create a new project:**

   - Click on the project dropdown in the top menu and select "New Project."
   - Enter a name for your project and click "Create."

3. **Enable the Google Calendar API:**

   - In the left sidebar, go to `APIs & Services` > `Library`.
   - Search for "Google Calendar API" and click on it.
   - Click "Enable."

4. **Create OAuth 2.0 credentials:**

   - Go to `APIs & Services` > `Credentials`.
   - Click "Create Credentials" and select "OAuth 2.0 Client ID."
   - Configure the consent screen:
     - If prompted, set up your OAuth consent screen by providing the required details.
   - Choose "Application type" as `Desktop app`.
   - Give your OAuth client a name and click "Create."
   - Download the JSON file containing your client ID and secret, and save it as `credentials.json` in the same directory as the script.

## Setting Up the `eventsName.txt` File

1. **Create a file named `eventsName.txt` in the script directory.**

2. **List the event names:**

   The file should contain a JSON array of event names that you want to delete. Each event name should match exactly as it appears on your Google Calendar.

   Example content of `eventsName.txt`:

   ```json
   [
     "Advanced Topics in Visual Computing",
     "Advanced Topics in Machine Learning",
     "Software Design & Modeling",
     "Software Performance"
   ]
   ```

   Ensure that the event names are correctly spelled and formatted as they appear in your calendar.

## Running the Script

To run the script, follow these steps:

1. **Execute the script:**

   In your terminal, run:

   ```bash
   node index.js
   ```

   The script will first check for the presence of the `token.json` file:

   - **If the token is present and valid:** The script will prompt you for:
     - **Calendar ID**: Enter the email address associated with the Google Calendar you want to modify (e.g., `your.email@gmail.com`).
     - **Start Date**: The start date of the range in `dd/mm/yyyy` format.
     - **End Date**: The end date of the range in `dd/mm/yyyy` format.

   - **If the token is missing or invalid:** The script will guide you through the OAuth authorization process. Follow the provided URL to authorize the app and enter the authorization code. When you reach `localhost`, take the **code** parameter from the URL. For example, from a URL like `http://localhost/?code=4/0AQlEXXXXXXoiafaow96gd2aCs58A&scope=https://www.googleapis.com/auth/calendar`, you should take `4/0AQlEXXXXXXoiafaow96gd2aCs58A`.

2. **Authorize the app (if needed):**

   - If prompted, visit the URL provided, grant the necessary permissions, and enter the code into the script prompt.

3. **The script will proceed to delete the specified events within the date range.**

   - Events matching the names listed in `eventsName.txt` within the specified date range will be deleted.

## Error Handling and User Prompts

- **Invalid Input:** If you input an invalid date format, Calendar ID, or any other incorrect value, the script will prompt you to re-enter the value.
- **Missing Files:** If the `eventsName.txt` file is missing or improperly formatted, the script will alert you and request corrections.
- **OAuth Token Issues:** If the OAuth token is missing or invalid, the script will guide you through the authorization process again.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This `README.md` provides all necessary instructions to set up, run, and troubleshoot the script. Make sure to replace `### YOUR CLIENT ID ###` and `### YOUR CLIENT SECRET ###` with your actual credentials in the script.