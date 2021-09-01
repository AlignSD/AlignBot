const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("queue for media links")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The Song You Want To Play")
        .setRequired(true)
    ),

  async execute(interaction) {
    const permissions = interaction.channel.permissionsFor(
      interaction.client.user
    );
    if (!permissions.has(["MANAGE_MESSAGES", "ADD_REACTIONS"]))
      return interaction.reply("queue.missingPermissionMessage");

    const queue = interaction.client.commands.get(interaction.guild.id);
    if (!queue) return interaction.channel.send("queue.errorNotQueue");

    let currentPage = 0;
    const embeds = generateQueueEmbed(interaction, queue.songs);

    const queueEmbed = await interaction.channel.send(
      `**"queue.currentPage" ${currentPage + 1}/${embeds.length}**`,
      embeds[currentPage]
    );

    try {
      await queueEmbed.react("⬅️");
      await queueEmbed.react("⏹");
      await queueEmbed.react("➡️");
    } catch (error) {
      console.error(error);
      interaction.channel.send(error.message).catch(console.error);
    }

    const filter = (reaction, user) =>
      ["⬅️", "⏹", "➡️"].includes(reaction.emoji.name) &&
      interaction.author.id === user.id;
    const collector = queueEmbed.createReactionCollector(filter, {
      time: 60000,
    });

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.name === "➡️") {
          if (currentPage < embeds.length - 1) {
            currentPage++;
            queueEmbed.edit("queue.currentPage", {
              page: currentPage + 1,
              length: embeds.length,
            }),
              embeds[currentPage];
          }
        } else if (reaction.emoji.name === "⬅️") {
          if (currentPage !== 0) {
            --currentPage;
            queueEmbed.edit("queue.currentPage", {
              page: currentPage + 1,
              length: embeds.length,
            }),
              embeds[currentPage];
          }
        } else {
          collector.stop();
          reaction.message.reactions.removeAll();
        }
        await reaction.users.remove(interaction.author.id);
      } catch (error) {
        console.error(error);
        return interaction.channel.send(error.message).catch(console.error);
      }
    });
  },
};

function generateQueueEmbed(interaction, queue) {
  let embeds = [];
  let k = 10;

  for (let i = 0; i < queue.length; i += 10) {
    const current = queue.slice(i, k);
    let j = i;
    k += 10;

    const info = current
      .map((track) => `${++j} - [${track.title}](${track.url})`)
      .join("\n");

    const embed = new MessageEmbed()
      .setTitle("queue.embedTitle")
      .setThumbnail(interaction.guild.iconURL())
      .setColor("#F8AA2A")
      .setDescription("queue.embedCurrentSong", {
        title: queue[0].title,
        url: queue[0].url,
        info: info,
      })

      .setTimestamp();
    embeds.push(embed);
  }

  return embeds;
}
