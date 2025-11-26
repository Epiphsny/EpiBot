import { Client, GatewayIntentBits, Events } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import { playMusic } from "./music.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!play ")) {
    const args = message.content.split(" ");
    const url = args[1];
    if (!url) return message.reply("Please provide a YouTube link!");

    playMusic(message, url); // call the function from music.js
  }
});

client.login(process.env.DISCORD_TOKEN);
