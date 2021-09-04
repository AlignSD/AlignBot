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

    if (interaction.user.username === "AlignSD") {
      if (!interaction.member.voice.channelId)
        return await interaction.reply({
          content: "You are not in a voice channel!",
          ephemeral: true,
        });
      if (
        interaction.guild.me.voice.channelId &&
        interaction.member.voice.channelId !==
          interaction.guild.me.voice.channelId
      )
        return await interaction.reply({
          content: "You are not in my voice channel!",
          ephemeral: true,
        });
      const query = interaction.options.get("query").value;
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

      if (!interaction.user.username === "AlignSD")
        return await interaction.reply({
          content: "Youre not authorized to use that command bitch",
        });

      console.log("Yes my lord");
      await interaction.deferReply();
      const track = await player
        .search(query, {
          requestedBy: interaction.user,
        })
        .then((x) => x.tracks[0]);

      if (!track)
        return await interaction.followUp({
          content: `❌ | Track **${query}** not found!`,
        });

      queue.play(track);

      return await interaction.followUp({
        content: `⏱️ | Loading track **${track.title}**!`,
      });
    } else
      return await interaction.reply({
        content: "Youre not authorized to use that command bitch",
      });
  },
};
