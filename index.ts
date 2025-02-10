import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

import { userRouter } from './src/routes/user';
import { transactionRouter } from './src/routes/transactions';
import { skillRouter } from './src/routes/skills';
import { serviceRouter } from './src/routes/serviceRequest';
import { teachRequestRouter } from './src/routes/teachRequest';
import { tradeRequestRouter } from './src/routes/tradeRequest';
import { messageRouter } from './src/routes/message';
import { meetingRouter } from './src/routes/createMeeting';

// Add custom WebSocket interface
interface CustomWebSocket extends WebSocket {
    userId?: string;
}

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use('/user', userRouter);
app.use('/transaction', transactionRouter);
app.use('/teachRequest', teachRequestRouter);
app.use('/tradeRequest', tradeRequestRouter);
app.use('/meeting', meetingRouter);
app.use('/messages', messageRouter);
app.use('/skill', skillRouter);
app.use('/service', serviceRouter);

// WebSocket Server
const wss = new WebSocketServer({ port: 8080 });

// Store active users { userId: WebSocket }
const usersMap = new Map<string, CustomWebSocket>();

wss.on('connection', (ws: CustomWebSocket) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
        const jsonMessage = JSON.parse(message.toString());
    
        if (jsonMessage.type === "Register") {  // Match frontend type
            const { senderId } = jsonMessage;
            ws.userId = senderId;
            usersMap.set(senderId, ws);
            console.log(`User ${senderId} registered`);
    
        } else if (jsonMessage.type === "Message") {  // Match frontend type
            await handleMessage(jsonMessage);
        }
    });

    ws.on('close', () => {
        if (ws.userId) {
            usersMap.delete(ws.userId);
            console.log(`User ${ws.userId} disconnected`);
        }
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

app.listen(3000, () => console.log("Server running on port 3000"));