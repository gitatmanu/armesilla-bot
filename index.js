const process = require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
client.login(process.parsed.TOKEN);

const queue = new Map();
const random_phrases = require('./random_phrases.js');


const words = {
  'armesilla': 'https://www.youtube.com/watch?v=QL5HYaVsJnw',
}

// Random phrases controller
client.on('ready', function() {
  random_phrases.play(client);
});

client.on('message', async (message) => {
  if (message.author.bot) return;
  
  message.content = message.content.toLowerCase();
  if (message.content == '/armesilla frases stop') {
    random_phrases.stop();
  } else if (message.content.startsWith('/armesilla ""')) {
    var interval_in_seconds = 'convert seconds to interval';
    random_phrases.set_interval(interval_in_seconds, client);
  }
});



// Play Sounds
client.on('message', async message => {
  if (message.author.bot) return;
  const serverQueue = queue.get(message.guild.id);
  
  message.content = message.content.toLowerCase();
  if (words.hasOwnProperty(message.content)) {
    execute(message, serverQueue, words[message.content]);
  }
  else if (message.content === 'stop') {
    stop(serverQueue);
  }
});



async function execute(message, serverQueue, song_url) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return;
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "No tengo permisos para entrar o hablar en tu canal de voz :("
    );
  }

  let songInfo;
  let url = song_url;
  songInfo = await ytdl.getInfo(url);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };
  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  }
  else {
    if (!message.guild.voice.channel) {
      try {
        var connection = await voiceChannel.join();
        serverQueue.connection = connection;
        play(message.guild, serverQueue.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return console.log(err);
        //return message.channel.send(err);
      }
    }
  }
}



function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection.play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
} 



function stop(serverQueue) {
  if (!serverQueue) return;

  serverQueue.songs = [];
  if (serverQueue.connection) serverQueue.connection.dispatcher.end();
}
