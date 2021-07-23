const phrases = [
    'El animalista coherente debe defender la zoofilia.',
    'El Imperio Español es la URSS del s.XVI.',
    'Semen retentum venenum est.',
    'Stalin fue un emperador de facto.',
    'Antimascotista siempre.',
    'El 155 es poco para lo que esta chusma aldeana merece.',
    'Si el GAL no hubiese salido a la luz, no matado inocentes, y hubiese hecho su trabajo de manera más efectiva, ahora sería recordado como lo mejor que hizo Felipe González durante su mandato.',
]

var interval_object;
var interval = 30000000;

function set_interval(new_interval, client) {
    interval = new_interval;
    refresh(client);
}

async function play(client) {
    var phrase;
    var previous_phrase;
    const channel_id = client.channels.cache.find(channel => channel.name === "general").id;
    var channel = await client.channels.fetch(channel_id).catch(console.log);

    interval_object = setInterval(function () {
        phrase = phrases[Math.floor(Math.random() * phrases.length)];

        while (previous_phrase === phrase) {
            phrase = phrases[Math.floor(Math.random() * phrases.length)];
        }
        channel.send(phrase);
        previous_phrase = phrase;
    }, interval);
}

function stop() {
    clearInterval(interval_object);
}

function refresh(client) {
    stop();
    play(client);
}

module.exports = {
    phrases,
    set_interval,
    play,
    stop
}