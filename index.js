import 'functions.js';

const process = require('dotenv').config();
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Discord.Client();
const queue = new Map();

client.login(process.parsed.TOKEN);


client.on('message', async message => {
  if (message.author.bot) return;
  const serverQueue = queue.get(message.guild.id);

  console.log(message.content);
  if (message.content.toLowerCase() === "armesilla") {
    playSound(message, serverQueue, "https://www.youtube.com/watch?v=jGy1PPNmU64&list=RDjGy1PPNmU64");
  }
  else if (message.content.startsWith("armesilla")) {
    sendMessage(message, serverQueue, 1);
  }
});