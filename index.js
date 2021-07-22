const process = require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const queue = new Map();

client.login(process.parsed.TOKEN);

const words = {
  'armesilla': 'https://www.youtube.com/watch?v=idh2RJtU5G8',

}

const phrases = [
  'El animalista coherente debe defender la zoofilia.',
  'El Imperio Español es la URSS del s.XVI.',
  'Semen retentum venenum est.',
  'Stalin fue un emperador de facto.',
  'El 155 es poco para lo que esta chusma aldeana merece.',
  'Si el GAL no hubiese salido a la luz, no matado inocentes, y hubiese hecho su trabajo de manera más efectiva, ahora sería recordado como lo mejor que hizo Felipe González durante su mandato.',
]

client.on('ready', async function() {
  const channel = await client.channels.fetch('865616567567122432').catch(console.log); // morralla channel id
  setInterval(function() {
    channel.send(phrases[Math.floor(Math.random() * phrases.length)]);
  }, 100000);
});


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