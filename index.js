// Require the necessary discord.js classes
const fs = require("fs");
const discord = require("discord.js");
const { Client, Collection, Intents } = require("discord.js");
const { TOKEN, YOUTUBE_API } = require("./config.json");
const { registerPlayerEvents } = require("./events/musicEvents");

const { Player } = require("discord-player");

/*
TODO: SECTION!
- TODO: Implement queue/playlist for music bot
- TODO: Implement Permission for / commands 
- TODO: Refractor Code its a mess atm
- TODO: Come up with a reaction bot that listens for certain words
- TODO: Make a Texas Hold'em Module
- TODO: Figure out how to make a webpage that will allow users to configure bots for
          this bot for their own servers
*/

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

// Create a new player instance
const player = new Player(client);

// TODO: make a player listener module
// Add the trackStart event so when a song will be played this message will be sent
player.on("trackStart", (queue, track) => {
  queue.metadata.send(
    `🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`
  );
});

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

module.exports.client = client;
module.exports.player = player;
