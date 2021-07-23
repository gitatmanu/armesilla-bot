const process = require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const random_phrases = require('./random_phrases.js');
const sounds = require('./sounds.js');

const queue = new Map();

// Random phrases controller
client.on('ready', function() {
  random_phrases.play(client);
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  
  message.content = message.content.toLowerCase();
  if (message.content === '/armesilla frases stop') {
    random_phrases.stop();
  } else if (message.content === '/armesilla frases start') {
    random_phrases.play(client);
  } else if (message.content.startsWith('/armesilla frases -')) {
    var interval_in_seconds = message.content.split('-')[1] * 1000;
    random_phrases.set_interval(interval_in_seconds, client);
  }
});


// Play Sounds controller
client.on('message', async message => {
  if (message.author.bot) return;
  const serverQueue = queue.get(message.guild.id);
  
  message.content = message.content.toLowerCase();
  if (sounds.words.hasOwnProperty(message.content)) {
    sounds.play_sound(message, serverQueue, sounds.words[message.content], queue);
  }
  else if (message.content === 'stop') {
    sounds.stop(serverQueue);
  }
});  

  
  client.login(process.parsed.TOKEN);