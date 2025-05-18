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
exports.app = void 0;
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
exports.app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.use('/user', user_1.userRouter);
exports.app.use('/transaction', transactions_1.transactionRouter);
exports.app.use('/teachRequest', teachRequest_1.teachRequestRouter);
exports.app.use('/tradeRequest', tradeRequest_1.tradeRequestRouter);
exports.app.use('/meeting', createMeeting_1.meetingRouter);
exports.app.use('/messages', message_1.messageRouter);
exports.app.use('/skill', skills_1.skillRouter);
exports.app.use('/service', serviceRequest_1.serviceRouter);
exports.app.use('/payment', payment_1.paymentRouter);
exports.app.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Health check');
}));
exports.app.get('/', (req, res) => {
    res.send('HTTP API is running');
});
exports.app.listen(3000, () => console.log(`HTTP Server running on port 30001`));
