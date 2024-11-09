const config = {
    name: "chords",
    aliases: ["chord"],
    description: "Search for chords by title or artist.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    if (!args.length) {
        return message.send("Please provide a song title or artist to search for chords.");
    }

    const query = args.join(" ");
    const apiUrl = `https://deku-rest-api.gleeze.com/search/chords?q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.chord) {
            const { title, artist, chords } = data.chord;
            const replyMessage = `
🎧 | Title: ${title}
🎤 | Artist: ${artist}
━━━━━━━━━━━━━━━━
${chords}
━━━━━━━━━━━━━━━━
            `;
            message.send(replyMessage);
        } else {
            message.send("No chords found for your search query.");
        }
    } catch (error) {
        console.error(error);
        message.send("An error occurred while fetching chords. Please try again later.");
    }
}

export default {
    config,
    onCall,
};