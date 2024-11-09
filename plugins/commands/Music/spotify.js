import axios from 'axios';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const config = {
    name: "spotify",
    aliases: ["play"],
    version: "1.7",
    credits: "Vex_Kshitiz/coffee",
    description: "Play a song from Spotify",
    usages: "<song-name> [by <artist>]",
    category: "Music",
    cooldown: 10
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cacheFolder = __dirname + '/cache';

// Function to create the cache folder if it doesn't exist
async function ensureCacheFolderExists() {
    try {
        await fs.ensureDir(cacheFolder);
    } catch (error) {
        console.error('Error creating cache folder:', error);
    }
}

async function onCall({ message, args, getLang }) {
    const { messageID, threadID } = message;
    const { songTitle, artist } = getSongTitleAndArtist(args);

    if (!songTitle) {
        return message.send(header + getLang("message") + footer);
    }

    try {
        // Ensure that the cache folder exists
        await ensureCacheFolderExists();

        await message.react("⌛");

        // Array of services to fetch track URLs
        const services = [
            { url: 'https://spotify-play-iota.vercel.app/spotify', params: { query: songTitle } },
            { url: 'http://zcdsphapilist.replit.app/spotify', params: { q: songTitle } },
            { url: 'https://openapi-idk8.onrender.com/search-song', params: { song: songTitle } },
            { url: 'https://markdevs-last-api.onrender.com/search/spotify', params: { q: songTitle } }
        ];

        // Fetch track URLs from multiple services
        const trackURLs = await fetchTrackURLs(services);
        const trackID = trackURLs[0];

        // Fetch download link for the selected track ID
        const downloadResponse = await axios.get(`https://sp-dl-bice.vercel.app/spotify?id=${encodeURIComponent(trackID)}`);
        const downloadLink = downloadResponse.data.download_link;

        // Download the track and send as a reply
        const filePath = await downloadTrack(downloadLink);
        await message.reply({
            body: `🎧 Playing: ${songTitle}${artist ? ` by ${artist}` : ''}`,
            attachment: fs.createReadStream(filePath)
        });

        // Delete the downloaded file after sending
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
            else console.log("File deleted successfully.");
        });

        console.log("Audio sent successfully.");
    } catch (error) {
        console.error("Error occurred:", error);
        await message.send(header + `An error occurred: ${error.message}` + footer);
    }
}

function getSongTitleAndArtist(args) {
    let songTitle, artist;

    const byIndex = args.indexOf("by");
    if (byIndex !== -1 && byIndex > 0 && byIndex < args.length - 1) {
        songTitle = args.slice(0, byIndex).join(" ");
        artist = args.slice(byIndex + 1).join(" ");
    } else {
        songTitle = args.join(" ");
    }

    return { songTitle, artist };
}

async function fetchTrackURLs(services) {
    for (const service of services) {
        try {
            const response = await axios.get(service.url, { params: service.params });

            if (response.data.trackURLs && response.data.trackURLs.length > 0) {
                console.log(`Track URLs fetched from ${service.url}`);
                return response.data.trackURLs;
            } else {
                console.log(`No track URLs found at ${service.url}`);
            }
        } catch (error) {
            console.error(`Error with ${service.url} API:`, error.message);
        }
    }

    throw new Error("No track URLs found from any API.");
}

async function downloadTrack(url) {
    const response = await axios.get(url, { responseType: 'stream' });
    const filePath = `${cacheFolder}/${randomString()}.mp3`;

    const writeStream = fs.createWriteStream(filePath);
    response.data.pipe(writeStream);

    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
    });
}

function randomString(length = 10) {
    return Math.random().toString(36).substring(2, 2 + length);
}

export default {
    config,
    onCall
};