const { SlashCommandBuilder } = require("@discordjs/builders");
const { play } = require("../include/play");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const https = require("https");
const {
  YOUTUBE_API_KEY,
  SOUNDCLOUD_CLIENT_ID,
  DEFAULT_VOLUME,
} = require("../modules/utils");
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays link provided thru voice channel"),
  async execute(interaction, args) {
    const { channel } = interaction.member.voice;
    console.log(
      interaction.client.commands[2],
      "LOOKSDKFSODKFSKDFKOSDFOKSDFKOSDFOKSD"
    );
    const serverQueue = interaction.client.commands.get(interaction.guild.id);

    if (!channel)
      return interaction.reply("youre not in a channel").catch(console.error);
    if (serverQueue && channel !== interaction.guild.me.voice.channel)
      return message
        .reply("usage reply", { prefix: interaction.client.prefix })
        .catch(console.error);
    if (!args.length)
      return interaction.reply("no link provided").catch(console.error);

    const permission = channel.permissionFor(interaction.client.user);
    if (!permission.has("CONNECT"))
      return interaction.reply("Missing Permmissions Connect");
    if (!permission.has("SPEAK"))
      return interaction.reply("Missing Permmissions Speak");

    const search = args.join(" ");
    const videoPattern =
      /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
    const url = args[0];
    const urlValid = videoPattern.test(args[0]);

    // start playlist if the url is provided
    if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
      return interaction.client.commands.get("playlist").execute(message, args);
    } else if (scdl.isValidUrl(url) && url.includes("/sets/")) {
      return interaction.client.commands.get("playlist").execute(message, args);
    }

    if (mobileScRegex.test(url)) {
      try {
        https.get(url, function (res) {
          if (res.statusCode == "302") {
            return interaction.client.commands
              .get("play")
              .execute(message, [res.headers.location]);
          } else {
            return interaction
              .reply("No Content Could be Found At That Url")
              .catch(console.error);
          }
        });
      } catch (error) {
        console.error(error);
        return interaction.reply(error.interaction).catch(console.error);
      }
      return interaction
        .reply("Following url redirection ...")
        .catch(console.error);
    }

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: DEFAULT_VOLUME || 100,
      playing: true,
    };

    let songInfo = null;
    let song = null;

    if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds,
        };
      } catch (error) {
        console.error(error);
        return interaction.reply(error.message).catch(console.error);
      }
    } else if (scRegex.test(url)) {
      try {
        const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
        song = {
          title: trackInfo.title,
          url: trackInfo.permalink_url,
          duration: Math.ceil(trackInfo.duration / 1000),
        };
      } catch (error) {
        console.error(error);
        return interaction.reply(error.message).catch(console.error);
      }
    } else {
      try {
        const results = await youtube.searchVideos(search, 1, {
          part: "snippet",
        });
        // PATCH 1 : avoid cases when there are nothing on the search results.
        if (results.length <= 0) {
          // No video results.
          message.reply("play.songNotFound").catch(console.error);
          return;
        }
        songInfo = await ytdl.getInfo(results[0].url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds,
        };
      } catch (error) {
        console.error(error);
        return interaction.reply(error.message).catch(console.error);
      }
    }

    if (serverQueue) {
      serverQueue.songs.push(song);
      return serverQueue.textChannel
        .send("play.queueAdded", {
          title: song.title,
          author: message.author,
        })
        .catch(console.error);
    }

    queueConstruct.songs.push(song);
    interaction.client.queue.set(interaction.guild.id, queueConstruct);

    try {
      queueConstruct.connection = await channel.join();
      await queueConstruct.connection.voice.setSelfDeaf(true);
      play(queueConstruct.songs[0], message);
    } catch (error) {
      console.error(error);
      interaction.client.queue.delete(interaction.guild.id);
      await channel.leave();
      return interaction.channel
        .send("play.cantJoinChannel", { error: error })
        .catch(console.error);
    }
  },
};
