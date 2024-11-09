const config = {
    name: "blackbox",
    aliases: ["blackbox"],
    description: "Interacts with the Blackbox Conversational AI.",
    usage: "[query]",
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const query = args.join(" ") || "hello"; // Use user input or default to "hello"
    const apiUrl = `https://openapi-idk8.onrender.com/blackbox?chat=${encodeURIComponent(query)}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Format the response using the specified header and footer
        if (data && data.response) {
            const resdata = data.response;
            await message.send(resdata);
        } else {
            await message.send("No response from the API.");
        }
    } catch (error) {
        console.error("Error fetching from the API:", error);
        await message.send("An error occurred while fetching data.");
    }
}

export default {
    config,
    onCall,
};