## Autonomys Network SubMail Messenger

Welcome to the SubMail Messenger project! This is a blockchain messenger dApp that allows sending text messages with attachments to any Autonomys EVM wallet address.

### Prerequisites
- Node.js: Version 14 or higher is recommended.
- npm: Node Package Manager, comes with Node.js.

### Features

- **User-Friendly Interface**: Some text.

---

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
   npm install express @autonomys/auto-utils
   ```

### Starting the Server

7. **Run the Express Server**:

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
submail/
├── index.js
├── package.json
└── public/
    └── index.html
```

- **`index.js`**: The Express server file.
- **`package.json`**: Contains project metadata and dependencies.
- **`public/index.html`**: The main HTML file for the front-end.

--
