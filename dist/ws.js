"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const wss = new ws_1.WebSocketServer({ port: 8080 });
// Store active users { userId: WebSocket }
const usersMap = new Map();
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const jsonMessage = JSON.parse(message.toString());
        if (jsonMessage.type === "Register") {
            const { senderId } = jsonMessage;
            usersMap.set(senderId, ws);
            console.log(`User ${senderId} registered`);
        }
        else if (jsonMessage.type === "Message") {
            yield handleMessage(jsonMessage);
        }
    }));
    ws.on('close', () => {
        usersMap.forEach((socket, userId) => {
            if (socket === ws)
                usersMap.delete(userId);
        });
        console.log('Client disconnected');
    });
});
// Handle incoming messages
function handleMessage(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { senderId, receiverId, message } = data;
        try {
            const newMessage = yield prisma.message.create({
                data: { senderId, receiverId, content: message }
            });
            if (usersMap.has(receiverId)) {
                const receiverSocket = usersMap.get(receiverId);
                if (receiverSocket && receiverSocket.readyState === ws_1.WebSocket.OPEN) {
                    receiverSocket.send(JSON.stringify({
                        senderId,
                        receiverId,
                        content: message
                    }));
                }
            }
        }
        catch (error) {
            console.error("Database error:", error);
        }
    });
}
console.log("WebSocket Server running on port 8080");
