## SubMail Messenger

Welcome to the Autonomys Network SubMail Messenger project! This is a blockchain messenger dApp that allows sending text messages with attachments to any Autonomys EVM wallet address.

### Features

- **User-Friendly Interface**: one-page web application with a handy user interface
- **Message notifications**: instant notifications via IMs (Telegram, Discord) and email
- **Auto Drive archiving**: you can archive all your messages to the permanent Autonomys Auto Drive storage
- **Large attachments support**: sending large attachments encrypted via Auto Drive storage

### Deployed application link

You can check the live dApp demo here: https://submail.app/

---

### Prerequisites
- Node.js: Version 14 or higher is recommended.
- npm: Node Package Manager, comes with Node.js.
- MongoDB (local or cloud database like MongoDB Atlas).

## Getting Started

### Forking the Repository

1. **Fork the Repository on GitHub**:

   - Navigate to the original repository on GitHub.
   - Click on the **Fork** button at the top-right corner of the page.
   - This will create a copy of the repository under your GitHub account.

### Cloning the Repository

2. **Clone Your Forked Repository**:

   Open your terminal or command prompt and run the following command, replacing `<your-username>` with your GitHub username:

   ```bash
   git clone https://github.com/<your-username>/SubMail.git
   ```

3. **Navigate to the Project Directory**:

   ```bash
   cd SubMail
   ```

### Installing Dependencies

5. **Install Required Packages**:

   ```bash
   npm install
   ```

### Server Configuration

6. **Set the Server Parameters**:

   Copy `.env_sample` to `.env` and edit it to specify the actual server parameters:
   
   ```bash
   cp .env_sample .env
   nano .env
   ```

### Starting the Server

7. **Run the SubMail Server**:

   ```bash
   npm start
   ```

   You should see:

   ```
   Server running at http://localhost:3000
   ```

---

## Usage

8. **Access the Application**:

   Open your web browser and navigate to:

   ```
   http://localhost:3000/
   ```

   You should see the **SubMail** dApp web page.

---

## Project Structure

Your project directory should look like this:

```
SubMail/
├── index.js
├── package.json
└── contract/
    └── SubMail.sol
└── public/
    └── index.html
```

- **`index.js`**: The SubMail server file.
- **`package.json`**: Contains project metadata and dependencies.
- **`contract/SubMail.sol`**: The dApp smart contract source.
- **`public/index.html`**: The main HTML file for the front-end.

---
