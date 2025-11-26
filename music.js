// music.js
import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei";

// We'll initialize the player in your main bot file and pass it here
let player;

export function setPlayer(client) {
  player = new Player(client);
  player.extractors.register(YoutubeiExtractor);
}

// Play music
export async function playMusic(message, query) {
  if (!player) return message.reply("Music player not initialized.");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.reply("You must be in a voice channel!");

  try {
    // Create or get the queue
    const queue = player.nodes.create(message.guild, {
      metadata: message.channel,
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 5000,
      leaveOnEnd: true,
      leaveOnEndCooldown: 5000,
    });

    // Connect if not connected
    if (!queue.connection) await queue.connect(voiceChannel);

    // Search for the track
    const searchResult = await player.search(query, {
      requestedBy: message.author,
    });

    if (!searchResult || !searchResult.tracks.length)
      return message.reply("❌ No results found.");

    const track = searchResult.tracks[0];
    queue.addTrack(track);

    // Play the queue only if it's idle
    if (!queue.node.isPlaying()) {
      await queue.node.play();
      message.channel.send(`🎶 Now playing: **${track.title}**`);
    } else {
      message.channel.send(`✅ Added to queue: **${track.title}**`);
    }
  } catch (err) {
    console.error("Play command error:", err);
    message.reply(`❌ Failed to play: ${err.message}`);
  }
}

// Pause
export function pauseMusic(message) {
  const queue = player.nodes.get(message.guild);
  if (!queue || !queue.node.isPlaying())
    return message.reply("No song is currently playing.");
  queue.node.setPaused(true);
  message.reply("⏸ Music paused!");
}

// Resume
export function resumeMusic(message) {
  const queue = player.nodes.get(message.guild);
  if (!queue || !queue.node.isPlaying())
    return message.reply("No song is currently playing.");
  queue.node.setPaused(false);
  message.reply("▶ Music resumed!");
}

// Stop
export function stopMusic(message) {
  const queue = player.nodes.get(message.guild);
  if (!queue) return message.reply("No song is currently playing.");
  queue.delete();
  message.reply("⏹ Music stopped and queue cleared.");
}

// Skip
export function skipMusic(message) {
  const queue = player.nodes.get(message.guild);
  if (!queue || !queue.node.isPlaying())
    return message.reply("No song is currently playing.");
  queue.node.skip();
  message.reply("⏭ Song skipped!");
}

// Show Queue
export function showQueue(message) {
  const queue = player.nodes.get(message.guild);
  if (!queue || !queue.tracks.length)
    return message.reply("Queue is empty.");
  const list = queue.tracks
    .map((t, i) => `${i + 1}. ${t.title} (${t.duration})`)
    .join("\n");
  message.reply(`📜 Current Queue:\n${list}`);
}
