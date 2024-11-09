import samirapi from 'samirapi';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cachePath = './plugins/commands/cache';

const config = {
    name: "removebg",
    version: "1.0.0",
    permissions: [0, 1, 2],
    credits: "coffee",
    description: "Removes the background from an image.",
    commandCategory: "𝙸𝚖𝚊𝚐𝚎",
    usages: "Reply to an image message to remove its background.",
    cooldown: 5,
};

async function onCall({ message }) {
    const reply = message.messageReply;

    if (!reply?.attachments?.length) {
        return message.reply("Please reply to an image message to remove its background.");
    }

    if (reply.attachments[0].type !== "photo") {
        return message.reply("This is not a photo.");
    }

    try {
        const imageUrl = reply.attachments[0].url;
        const imageBuffer = await samirapi.remBackground(imageUrl);
        const filePath = path.join(cachePath, 'no_background.png');

        await fs.outputFile(filePath, imageBuffer);
        await message.reply({
            body: "Here is the image with the background removed",
            attachment: fs.createReadStream(filePath)
        });

        await fs.unlink(filePath);
    } catch (error) {
        console.error(error);
        return message.reply("An error occurred while executing the command.");
    }
}

export default {
    config,
    onCall
};