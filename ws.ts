import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
const PORT = process.env.PORT ;

const prisma = new PrismaClient();
const wss = new WebSocketServer({ port: parseInt(PORT) });

// Store active users { userId: WebSocket }
const usersMap = new Map<string, WebSocket>();

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
        const jsonMessage = JSON.parse(message.toString());

        if (jsonMessage.type === "Register") {
            const { senderId } = jsonMessage;
            usersMap.set(senderId, ws);
            console.log(`User ${senderId} registered`);
        } else if (jsonMessage.type === "Message") {
            await handleMessage(jsonMessage);
        }
    });

    ws.on('close', () => {
        usersMap.forEach((socket, userId) => {
            if (socket === ws) usersMap.delete(userId);
        });
        console.log('Client disconnected');
    });
});

// Handle incoming messages
async function handleMessage(data: any) {
    const { senderId, receiverId, message } = data;

    try {
        const newMessage = await prisma.message.create({
            data: { senderId, receiverId, content: message }
        });

        if (usersMap.has(receiverId)) {
            const receiverSocket = usersMap.get(receiverId);
            if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
                receiverSocket.send(JSON.stringify({
                    senderId,
                    receiverId,
                    content: message
                }));
            }
        }
    } catch (error) {
        console.error("Database error:", error);
    }
}

console.log("WebSocket Server running on port 8080");
