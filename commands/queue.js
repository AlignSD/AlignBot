const { SlashCommandBuilder } = require("@discordjs/builders");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("See queue for song list"),

  async execute(interaction) {
    const client = require("..");
    const player = client.player;

    if (interaction.user.username === "AlignSD") {
      if (!interaction.member.voice.channelId) {
        return await interaction.reply({
          content: "You are not in a voice channel!",
          ephemeral: true,
        });
      }
      // Check if bot and client are in same channel and are able to be in same channel
      if (
        interaction.guild.me.voice.channelId &&
        interaction.member.voice.channelId !==
          interaction.guild.me.voice.channelId
      )
        return await interaction.reply({
          content: "We are not in the same voice channel",
          ephemeral: true,
        });

      await interaction.deferReply();
      const queue = player.getQueue(interaction.guildId);

      if (!queue.tracks)
        return void interaction.followUp({
          content: "There is no queue",
        });

      if (queue.tracks.length !== 0) {
        console.log(queue.tracks, " queue.tracks");
        for (let i = 0; i <= queue.tracks.length; i++) {
          let trackList = queue.tracks[i];
          return void interaction.followUp({
            content: `Track Queue:\n Title: ${trackList.title}, Artist: ${trackList.author}\n ${trackList.thumbnail} `,
          });
        }
      }
    }
  },
};
