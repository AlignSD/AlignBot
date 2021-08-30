const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays link provided thru voice channel"),
  async execute(interaction) {
    return interaction.reply("Here's a funky tune just for you!");
  },
};
