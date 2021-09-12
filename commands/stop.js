const { SlashCommandBuilder } = require("@discordjs/builders");
const { Player } = require("discord-player");
const { Client, Intents } = require("discord.js");
const GUILD_ID = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops any music playing"),
  async execute(interaction) {
    const client = require("..");
    const player = client.player;

    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);

    if (!queue || !queue.playing)
      return void interaction.followUp({
        content: "❌ | No music is being played!",
      });
      
    queue.destroy();
    return void interaction.followUp({ content: "🛑 | Stopped the player!" });
  },
};
