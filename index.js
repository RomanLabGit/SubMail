const { createAutoDriveApi, uploadFile, downloadFile } = require('@autonomys/auto-drive');
const express = require('express');
const path = require('path');
const { ethers } = require("ethers");
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const fs = require("fs");
require("dotenv").config(); // Load environment variables from .env file

// Load contract ABI from external file
const contractABI = JSON.parse(fs.readFileSync("./contract/SubMail_abi.json", "utf8"));

// Get values from .env file
const providerURL = process.env.PROVIDER_URL;
const contractAddress = process.env.SUBMAIL_CONTRACT_ADDRESS;
const mongoConnection = process.env.MONGODB_CONNECTION;
const tgToken = process.env.TG_BOT_TOKEN;
const port = process.env.HTTP_PORT;

// Ensure environment variables are defined
if (!providerURL || !contractAddress || !mongoConnection || !tgToken || !port) {
  console.error("Missing PROVIDER_URL or CONTRACT_ADDRESS or MONGODB_CONNECTION or TG_BOT_TOKEN or HTTP_PORT in .env file");
  process.exit(1);
}

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Set up MongoDB connection
mongoose.connect(mongoConnection);
const db = mongoose.connection;

// Check MongoDB connection
db.on('error', (error) => {
  console.error("MongoDB connection error:", error);
});
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define Subscriber schema and model
const subscriberSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  userAddress: { type: String, required: true },
});
const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// Connect to the EVM chain
const provider = new ethers.providers.JsonRpcProvider(providerURL);

// Create a contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Listen for the MessageSent event
const initializeEventWatcher = async () => {
  await contract.on("MessageSent", async (sender, recipient, timestamp, message) => {
    try {
      const tg_message = `Message From: ${sender}\nTo: ${recipient}\nTimestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}\nMessage: ${message}`;
      console.log(tg_message);

      const subscribers = await Subscriber.find({ userAddress: recipient });

      subscribers.forEach(async (subscriber) => {
        await TGBot.telegram.sendMessage(subscriber.userId, tg_message);
      });
    } catch (error) {
        console.error('Error: ', error);
    }
  });
};

initializeEventWatcher();

// Handle provider errors
provider.on("error", (error) => {
  console.error("Error with provider:", error);
});

// Telegram Bot
const TGBot = new Telegraf(tgToken);

// Handle /start command
TGBot.start(async (ctx) => {
  const userAddress = ctx.startPayload;

  if (!userAddress) {
    return ctx.reply('Welcome! Use /subscribe <address> to receive notifications, /unsubscribe to cancel notifications, /archive <auto_drive_api_key> to archive all your messages to auto-drive storage.');
  }

  const userId = ctx.from.id;
  try {
    // Check if user is already subscribed
    const existingSubscriber = await Subscriber.findOne({ userId });
    if (existingSubscriber) {
      return ctx.reply(`You are already subscribed to ${existingSubscriber.userAddress}`);
    }
    // Save subscriber in the database
    const newSubscriber = new Subscriber({
      userId,
      userAddress,
    });
    await newSubscriber.save();
    return ctx.reply(`You have successfully subscribed to ${userAddress}`);
  } catch (error) {
    console.error(error);
    return ctx.reply('An error occurred while subscribing');
  }
});

// Handle /subscribe <address> command
TGBot.command('subscribe', async (ctx) => {
  const userAddress = ctx.message.text.split(' ')[1];

  if (!userAddress || !ethers.utils.isAddress(userAddress)) {
    return ctx.reply('Please provide a valid Ethereum address. Example: /subscribe 0xYourAddress');
  }

  const userId = ctx.from.id;

  try {
    // Check if user is already subscribed
    const existingSubscriber = await Subscriber.findOne({ userId });
    if (existingSubscriber) {
      return ctx.reply(`You are already subscribed to ${existingSubscriber.userAddress}`);
    }

    // Save subscriber in the database
    const newSubscriber = new Subscriber({
      userId,
      userAddress,
    });
    await newSubscriber.save();

    return ctx.reply(`You have successfully subscribed to ${userAddress}`);
  } catch (error) {
    console.error(error);
    return ctx.reply('An error occurred while subscribing');
  }
});

// Handle /unsubscribe command
TGBot.command('unsubscribe', async (ctx) => {
  const userId = ctx.from.id;

  try {
    // Find and remove the subscriber from the database
    const subscriber = await Subscriber.findOneAndDelete({ userId });
    if (subscriber) {
      return ctx.reply(`You have unsubscribed from ${subscriber.userAddress}`);
    } else {
      return ctx.reply('You are not subscribed to any address');
    }
  } catch (error) {
    console.error(error);
    return ctx.reply('An error occurred while unsubscribing');
  }
});

// Handle /archive command
TGBot.command('archive', async (ctx) => {
  const userId = ctx.from.id;

  try {
    // Find the subscriber in the database
    const subscriber = await Subscriber.findOne({ userId });
    if (subscriber) {
      const adApiKey = ctx.message.text.split(' ')[1];
      if (!adApiKey) {
        return ctx.reply('Please provide your auto-drive api key. Example: /archive YourApiKey');
      }

      // Get all the messages
      const data = contract.interface.encodeFunctionData("readMessages", []);
      const response = await provider.call({
        to: contractAddress,
        from: subscriber.userAddress, // This ensures msg.sender is set correctly!
        data: data,
      });
      const decodedResult = contract.interface.decodeFunctionResult("readMessages", response);

      let msgs = "";
        decodedResult[0].forEach( ( item ) => {
          const timestamp = new Date( 1000*item[1].toNumber() ).toLocaleString();
          msgs = msgs + timestamp + " From: " + item[0] + "\n" + item[2]+"\n\n";
        });

      console.log(msgs);

      // Save the messages to auto-drive storage
      const adApi = createAutoDriveApi({ apiKey: adApiKey });

      const buffer = Buffer.from(msgs, 'utf-8');
      const file = {
        read: async function* () {
          yield buffer;
        },
        name: 'messages.txt',
        mimeType: 'text/plain',
        size: buffer.length
      };

      const cid = await uploadFile(adApi, file, {
        compression: true,
        onProgress: (progress) => {
            console.log(`Upload progress: ${progress}%`);
        }
      });

      return ctx.reply(`You have archived all the messages to ${subscriber.userAddress} with CID ${cid}`);
    } else {
      return ctx.reply('You are not subscribed to any address');
    }
  } catch (error) {
    console.error(error);
    return ctx.reply('An error occurred while archiving');
  }
});

// Start the Telegram bot
TGBot.launch();
