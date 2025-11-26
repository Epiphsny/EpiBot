// music.js
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import ytdl from "ytdl-core";

export async function playMusic(message, url) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.reply("You must be in a voice channel!");

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  const stream = ytdl(url, { filter: "audioonly" });
  const resource = createAudioResource(stream);
  const player = createAudioPlayer();

  player.play(resource);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Playing, () => {
    message.reply(`🎶 Now playing: ${url}`);
  });

  player.on("error", (error) => {
    console.error(error);
    message.reply("❌ Error playing the song.");
  });
}