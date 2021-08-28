const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Replies with server info!"),
  async execute(interaction) {
    await interaction.reply(
      `Server name: ${interaction.guild.name}\nTotal memebers: ${interaction.guild.memberCount}\nServers Birthdate: ${interaction.guild.createdAt}`
    );
  },
};
