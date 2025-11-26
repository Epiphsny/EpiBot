// index.js
import { Client, GatewayIntentBits, Events } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import { playMusic, pauseMusic, resumeMusic, stopMusic, skipMusic, showQueue } from "./music.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args[0];
  const query = args.slice(1).join(" ");

  switch (command) {
    case "!play":
      if (!query) return message.reply("Please provide a song name or URL!");
      playMusic(message, query);
      break;

    case "!pause":
      pauseMusic(message);
      break;

    case "!resume":
      resumeMusic(message);
      break;

    case "!stop":
      stopMusic(message);
      break;

    case "!skip":
      skipMusic(message);
      break;

    case "!queue":
      showQueue(message);
      break;
  }
});

client.login(process.env.DISCORD_TOKEN);
