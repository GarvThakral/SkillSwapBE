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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const client_1 = require("@prisma/client");
const user_1 = require("./src/routes/user");
const transactions_1 = require("./src/routes/transactions");
const skills_1 = require("./src/routes/skills");
const serviceRequest_1 = require("./src/routes/serviceRequest");
const teachRequest_1 = require("./src/routes/teachRequest");
const tradeRequest_1 = require("./src/routes/tradeRequest");
const message_1 = require("./src/routes/message");
const createMeeting_1 = require("./src/routes/createMeeting");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/user', user_1.userRouter);
app.use('/transaction', transactions_1.transactionRouter);
app.use('/teachRequest', teachRequest_1.teachRequestRouter);
app.use('/tradeRequest', tradeRequest_1.tradeRequestRouter);
app.use('/meeting', createMeeting_1.meetingRouter);
app.use('/messages', message_1.messageRouter);
app.use('/skill', skills_1.skillRouter);
app.use('/service', serviceRequest_1.serviceRouter);
// WebSocket Server
const wss = new ws_1.WebSocketServer({ port: 8080 });
// Store active users { userId: WebSocket }
const usersMap = new Map();
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        const jsonMessage = JSON.parse(message.toString());
        if (jsonMessage.type === "Register") { // Match frontend type
            const { senderId } = jsonMessage;
            ws.userId = senderId;
            usersMap.set(senderId, ws);
            console.log(`User ${senderId} registered`);
        }
        else if (jsonMessage.type === "Message") { // Match frontend type
            yield handleMessage(jsonMessage);
        }
    }));
    ws.on('close', () => {
        if (ws.userId) {
            usersMap.delete(ws.userId);
            console.log(`User ${ws.userId} disconnected`);
        }
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
                if (receiverSocket.readyState === ws_1.WebSocket.OPEN) {
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
app.listen(3000, () => console.log("Server running on port 3000"));
