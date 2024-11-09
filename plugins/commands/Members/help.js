const config = {
    name: "help",
    aliases: ["help"],
    version: "1.0.3",
    description: "Show all commands or command details",
    usage: "[command] (optional)",
    credits: "zishin"
};

async function onCall({ message, args }) {
    const { commandsConfig } = global.plugins;
    const commandName = args[0]?.toLowerCase();

    if (!commandName) {
        const commandList = Array.from(commandsConfig.keys()).map((key, index) => `\t${index + 1}. 「 ${key} 」`).join("\n");

        return message.reply(`
「 COMMAND LIST 」

${commandList}

Total commands: ${commandsConfig.size}
To view information about a specific command, type 'help <command>'
        `);
    }

    const command = commandsConfig.get(commandName);
    if (!command || command.isHidden) {
        return message.reply(`Command ${commandName} does not exist or you do not have permission to access it.`);
    }

    message.reply(`
「 Command Info 」

➛ Name: ${command.name}
➛ Version: ${command.version || 'N/A'}
➛ Aliases: ${command.aliases?.join(", ") || 'None'}
➛ Permission: ${command.permissions?.join(", ") || 'None'}
➛ Usage: ${command.usage || 'No usage provided'}
    `.replace(/^ +/gm, ''));
}

export default {
    config,
    onCall
};