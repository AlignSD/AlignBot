const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Increase/Decrease Volume")
    .addStringOption((options) => 
      options
      .setName("query")
      .setDescription("What would you like to se the volume to 0-10")
      .setRequired(true)
    ),
  async execute(interaction) {
    const client = require("..");
    const player = client.player;
    
    // I am the one true god
    if (interaction.user.username === "AlignSD") {
      // If I'm not in a channel
      if (!interaction.member.voice.channelId) {
        return await interaction.reply({
          content: "You're not in a voice channel",
          ephemeral: true,
        })
      }
      // Check if the bot can join the channel
      if (
       interaction.guild.me.voice.channelId &&
       interaction.member.voice.channelId !==
        interaction.guild.me.voice.channelId
      )
        return await interaction.reply({
          content: "I am not capable of joining the channel that you are in",
          ephemeral: true,
        });

      // take number value from query string and convert it/validate it
      const queryNumber = Math.floor(parseInt(interaction.options.get("query").value));
      console.log(typeof queryNumber, "queryNumber");

      if (queryNumber > 10) {
        queryNumber === 10;
      } else if (queryNumber < 0) {
        queryNumber === 0;
      } else if (typeof queryNumber !== "number") {
        interaction.reply({
          content: "You must reply with number",
          ephemeral: true,
        })
      }

      // allow time for user to input volume value
      await interaction.deferReply();
      const volume = player.getQueue(interaction.guildId)

      // if (!volume)
      //   return void interaction.followUp({ content: "Theres nothing to set a volume to dummy" })
      // if (volume) {
        volume.setVolume(queryNumber * 10);  
    }
  }
}