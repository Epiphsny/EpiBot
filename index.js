// index.js
import { Client, GatewayIntentBits, Events } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import {
  setPlayer,
  playMusic,
  pauseMusic,
  resumeMusic,
  stopMusic,
  skipMusic,
  showQueue,
} from "./music.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize Discord Player
setPlayer(client);

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args[0].toLowerCase();
  const query = args.slice(1).join(" ");

  switch (command) {
    case "!play":
      if (!query) return message.reply("Provide a song name or YouTube link!");
      await playMusic(message, query);
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