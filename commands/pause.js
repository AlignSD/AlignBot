const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pauses current track"),

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

      if (queue.setPaused() === true) {
        queue.setPaused(false);
      } else queue.setPaused(true);

      return await interaction.followUp({
        content: `Yes My Lord! ⏱️ | Pausing song**!`,
      });
    } else
      return await interaction.reply({
        content: "Youre not authorized to use that command bitch",
      });
  },
};
