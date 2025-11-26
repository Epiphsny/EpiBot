// music.js
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } from "@discordjs/voice";
import ytdl from "ytdl-core";
import yts from "yt-search";

// Store music queues per guild
const guildQueues = new Map();

async function playNext(guildId, message) {
  const queue = guildQueues.get(guildId);
  if (!queue || queue.songs.length === 0) {
    if (queue?.connection) {
      queue.connection.destroy();
    }
    guildQueues.delete(guildId);
    return;
  }

  const song = queue.songs[0];
  const stream = ytdl(song.url, { filter: "audioonly", highWaterMark: 1 << 25 });
  const resource = createAudioResource(stream);

  queue.player.play(resource);
  queue.connection.subscribe(queue.player);

  queue.player.once(AudioPlayerStatus.Idle, () => {
    queue.songs.shift(); // remove finished song
    playNext(guildId, message); // play next song
  });

  message.channel.send(`🎶 Now playing: ${song.title}`);
}

/**
 * Add song to queue and start playing if needed
 */
export async function playMusic(message, query) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.reply("You must be in a voice channel!");

  // Search YouTube if query is not a URL
  let url = query;
  let title = query;
  if (!query.startsWith("https://")) {
    const searchResult = await yts(query);
    if (!searchResult || !searchResult.videos.length) {
      return message.reply("❌ No results found.");
    }
    url = searchResult.videos[0].url;
    title = searchResult.videos[0].title;
  }

  let queue = guildQueues.get(message.guild.id);

  // If queue doesn't exist, create it
  if (!queue) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

    const player = createAudioPlayer();

    queue = {
      connection,
      player,
      songs: [],
    };

    guildQueues.set(message.guild.id, queue);
  }

  // Add song to queue
  queue.songs.push({ url, title });

  // If nothing is playing, start
  if (queue.player.state.status !== AudioPlayerStatus.Playing) {
    playNext(message.guild.id, message);
  } else {
    message.reply(`✅ Added to queue: ${title}`);
  }
}

// Pause, Resume, Stop functions
export function pauseMusic(message) {
  const queue = guildQueues.get(message.guild.id);
  if (!queue) return message.reply("No song is currently playing.");
  queue.player.pause();
  message.reply("⏸ Music paused!");
}

export function resumeMusic(message) {
  const queue = guildQueues.get(message.guild.id);
  if (!queue) return message.reply("No song is currently playing.");
  queue.player.unpause();
  message.reply("▶ Music resumed!");
}

export function stopMusic(message) {
  const queue = guildQueues.get(message.guild.id);
  if (!queue) return message.reply("No song is currently playing.");
  queue.player.stop();
  queue.connection.destroy();
  guildQueues.delete(message.guild.id);
  message.reply("⏹ Music stopped and disconnected.");
}

// Skip current song
export function skipMusic(message) {
  const queue = guildQueues.get(message.guild.id);
  if (!queue || queue.songs.length === 0) return message.reply("No song to skip.");
  queue.player.stop(); // triggers playNext automatically
  message.reply("⏭ Song skipped!");
}

// Show current queue
export function showQueue(message) {
  const queue = guildQueues.get(message.guild.id);
  if (!queue || queue.songs.length === 0) return message.reply("Queue is empty.");
  const list = queue.songs.map((s, i) => `${i + 1}. ${s.title}`).join("\n");
  message.reply(`📜 Current Queue:\n${list}`);
}
