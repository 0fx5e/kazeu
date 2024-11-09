import axios from 'axios';

const config = {
    name: "gpt",
    aliases: ["chatgpt"],
    description: "Ask a question to the GPT.",
    usage: "[query]",
    category: "Education",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "RN",
};

async function onCall({ message, args }) {
    if (!args.length) {
        message.reply("Hello! How can I assist you today");
        return;
    }

    let query = args.join(" ");
    const uid = message.senderID;

    try {
        const typ = global.api.sendTypingIndicator(message.threadID);

        // Send request to the new API with the query
        const response = await axios.get(`https://fred.hidencloud.com:25939/gpt4?prompt=${encodeURIComponent(query)}&id=${uid}`);

        typ();
        
        console.log("API response: ", response.data);

        if (response.data && response.data.gpt4) {
            const gptResponse = response.data.gpt4;
            await message.send(gptResponse);
        } else {
            await message.send("Error: Unexpected response format from API.");
        }
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        message.react(`❎`);
    }
}

export default {
    config,
    onCall
};