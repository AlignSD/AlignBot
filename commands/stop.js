const { SlashCommandBuilder } = require("@discordjs/builders");
const { Player } = require("discord-player");
const { Client, Collection, Intents } = require("discord.js");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});
const player = new Player(client);
module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops any music playing"),
  async execute(interaction) {
    try {
      await interaction.deferReply();
      // if (!queue || !queue.playing)
      //   return void interaction.followUp({
      //     content: "❌ | No music is being played!",
      //   });
      console.log(interaction.guild.id, "interaction.guild");
      console.log(player, "player interaction");
      player.deleteQueue(interaction.guildId);
      return void interaction.followUp({ content: "🛑 | Stopped the player!" });
    } catch (err) {
      console.error(err);
    }
  },
};
