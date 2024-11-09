const config = {
    name: "unsend",
    aliases: ["unsend"],
    description: "Unsend bot's message",
    usage: "[reply]",
    category: "𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
};

async function onCall({ message, args, data, userPermissions }) {
    try {
        // Check if the message is a reply to the bot's message
        if (message.type !== "message_reply") {
            return message.reply("You must reply to the bot's message");
        }
        if (message.messageReply?.senderID !== global.botID) {
            return message.reply("The message you replied to is not from the bot");
        }

        const targetMessageID = message.messageReply.messageID;

        // Attempt to unsend the message
        global.api.unsendMessage(targetMessageID, (error) => {
            if (error) {
                console.error("Error unsending message:", error);
                message.react("❌");
            } else {
                message.react("✅");
            }
        });
    } catch (err) {
        console.error("Unhandled error:", err);
        message.reply("An error has occurred");
    }
}

export default {
    config,
    onCall
};