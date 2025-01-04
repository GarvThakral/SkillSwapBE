"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("./src/routes/user");
const transactions_1 = require("./src/routes/transactions");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/user', user_1.userRouter);
app.use('/transaction', transactions_1.transactionRouter);
app.listen(3000);
