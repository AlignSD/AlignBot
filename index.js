// Require the necessary discord.js classes
const fs = require("fs");
const discord = require("discord.js");
const { Client, Collection, Intents } = require("discord.js");
const { TOKEN, YOUTUBE_API } = require("./config.json");

const { Player } = require("discord-player");

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

const player = new Player(client);
// add the trackStart event so when a song will be played this message will be sent

player.on("trackStart", (queue, track) =>
  queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`)
);
// Load Bot Event Listeners
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

// Loop thru all files in events directory
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Load Bot Commands
client.commands = new Collection();

// set commandFiles array using fs module to store all command files
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  const data = command.data.toJSON();
  client.commands.set(data.name, command);
}

// Command Listener
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  // @params ephemeral option shows response only to the executor of the /command
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// Login to Discord with your client's token
client.login(TOKEN);
