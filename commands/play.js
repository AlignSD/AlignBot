const { SlashCommandBuilder } = require("@discordjs/builders");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays link provided thru voice channel")
    .addStringOption((options) =>
      options
        .setName("query")
        .setDescription("The Song You Want To Play")
        .setRequired(true)
    ),
  async execute(interaction) {
    const client = require("..");
    const player = client.player;
    console.log(interaction.guild.id, "player guild");
    // prevent my friends from using this against me
    if (interaction.user.username === "AlignSD") {
      // check if user is in a voice channel

      if (!interaction.member.voice.channelId)
        return await interaction.reply({
          content: "You are not in a voice channel!",
          ephemeral: true,
        });

      // check if user is in channel bot is allowed to be in
      if (
        interaction.guild.me.voice.channelId &&
        interaction.member.voice.channelId !==
          interaction.guild.me.voice.channelId
      )
        return await interaction.reply({
          content: "You are not in my voice channel!",
          ephemeral: true,
        });

      // query variable stores users song search query
      const query = interaction.options.get("query").value;

      // queue creates a queue for songs... who woulda thought
      const queue = player.createQueue(interaction.guild, {
        metadata: {
          channel: interaction.channel,
        },
      });

      // verify vc connection
      try {
        if (!queue.connection)
          await queue.connect(interaction.member.voice.channel);
      } catch {
        queue.destroy();
        return await interaction.deferreply({
          content: "Could not join your voice channel!",
          ephemeral: true,
        });
      }

      await interaction.deferReply();
      const track = await player
        .search(query, {
          requestedBy: interaction.user,
        })
        .then((x) => x.tracks[0]);

      if (!track)
        return await interaction.followUp({
          content: `??? | Track **${query}** not found!`,
        });

      queue.play(track);
      queue.setVolume(50);

      // Send confirmations when tracks are added to the queue.
      // If there arent any songs in the queue send a different message.
      if (queue.tracks.length == 0) {
        return await interaction.followUp({
          content: `Yes My Lord! ?????? | Loading track **${track.title}**!`,
        });
      } else {
        return await interaction.followUp({
          content: `Yes My Lord! ?????? | Adding track to queue **${track.title}**!`,
        });
      }
    } else
      return await interaction.reply({
        content: "Youre not authorized to use that command bitch",
      });
  },
};
