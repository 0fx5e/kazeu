import fs from 'fs';
import path from 'path';

const commandRootDir = path.resolve('./plugins/commands');
const fallbackCommandPath = path.join(commandRootDir, '6i.js');

const fetchCommandFiles = () => {
    const commandFiles = [];

    const categories = fs.readdirSync(commandRootDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const category of categories) {
        const commandDir = path.join(commandRootDir, category);
        const commands = fs.readdirSync(commandDir)
            .filter(file => file.endsWith('.js'))
            .map(file => path.join(commandDir, file));

        if (commands.length > 0) {
            commandFiles.push({
                category,
                commands
            });
        }
    }

    return commandFiles;
};

const loadCommand = async (filePath) => {
    try {
        const { default: commandModule } = await import(filePath);
        if (commandModule?.config?.name) {
            return { commandModule, name: commandModule.config.name };
        } else {
            console.warn(`Command config.name not found in ${filePath}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to load command from ${filePath}:`, error);
        return null;
    }
};

async function onCall({ message }) {
    const input = message.body.trim().toLowerCase();

    const commandFiles = fetchCommandFiles();
    for (const { commands } of commandFiles) {
        for (const filePath of commands) {
            const commandData = await loadCommand(filePath);
            if (commandData && input.startsWith(commandData.name)) {
                const { commandModule, name } = commandData;

                if (commandModule?.config && commandModule.onCall) {
                    const args = input.slice(name.length).trim().split(" ");
                    const prefix = message.thread?.data?.prefix || global.config.PREFIX;

                    await commandModule.onCall({ 
                        message, 
                        args, 
                        data: { thread: { data: { prefix } } }, 
                        userPermissions: message.senderID, 
                        prefix 
                    });
                } else {
                    console.warn(`Command ${name} is not properly configured or missing onCall function.`);
                }
                return;
            }
        }
    }

    // No matching command found, call the fallback (ai.js)
    console.warn('No matching command found. Calling fallback command (ai.js).');
    try {
        const { default: fallbackCommand } = await import(fallbackCommandPath);
        if (fallbackCommand?.onCall) {
            // If no command found, trigger AI response by passing the message directly
            const args = [message.body.trim()];  // Use the message body as the query for the AI
            await fallbackCommand.onCall({ message, args });
        } else {
            console.error("Fallback command (ai.js) is missing an onCall function.");
        }
    } catch (error) {
        console.error("Failed to load fallback command (ai.js):", error);
    }
}

export default {
    onCall
};