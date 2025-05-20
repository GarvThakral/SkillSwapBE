"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const user_1 = require("./routes/user");
const transactions_1 = require("./routes/transactions");
const skills_1 = require("./routes/skills");
const serviceRequest_1 = require("./routes/serviceRequest");
const teachRequest_1 = require("./routes/teachRequest");
const tradeRequest_1 = require("./routes/tradeRequest");
const message_1 = require("./routes/message");
const createMeeting_1 = require("./routes/createMeeting");
const payment_1 = require("./routes/payment");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Routers
app.use('/user', user_1.userRouter);
app.use('/transaction', transactions_1.transactionRouter);
app.use('/teachRequest', teachRequest_1.teachRequestRouter);
app.use('/tradeRequest', tradeRequest_1.tradeRequestRouter);
app.use('/meeting', createMeeting_1.meetingRouter);
app.use('/messages', message_1.messageRouter);
app.use('/skill', skills_1.skillRouter);
app.use('/service', serviceRequest_1.serviceRouter);
app.use('/payment', payment_1.paymentRouter);
// Health check
app.get('/health', async (_req, res) => {
    console.log('Health check');
    res.status(200).json({ status: 'ok' });
});
app.get('/', (_req, res) => {
    res.send('HTTP API is running');
});
app.listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
