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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const key_id = (_a = process.env.RAZOR_KEY_ID) !== null && _a !== void 0 ? _a : "";
const key_secret = (_b = process.env.RAZOR_KEY_SECRET) !== null && _b !== void 0 ? _b : "";
var instance = new razorpay_1.default({
    key_id,
    key_secret
});
const prisma = new client_1.PrismaClient();
exports.paymentRouter = (0, express_1.Router)();
exports.paymentRouter.post("/create-order", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: "receipt#1",
    };
    try {
        const order = yield instance.orders.create(options);
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error });
    }
}));
exports.paymentRouter.post("/verify-payment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;
    const intId = parseInt(userId);
    const hmac = crypto_1.default.createHmac("sha256", key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");
    if (generatedSignature === razorpay_signature) {
        res.json({ success: true, message: "Payment verified" });
        const paymentDetails = yield instance.orders.fetch(razorpay_order_id);
        console.log(paymentDetails);
        let tokensInc;
        if (Number(paymentDetails.amount) / 100 == 1999) {
            tokensInc = 500;
        }
        else {
            tokensInc = Number(paymentDetails.amount) / 500;
        }
        const updatedUser = yield prisma.user.update({
            where: {
                id: intId
            },
            data: {
                tokens: {
                    increment: tokensInc
                }
            }
        });
    }
    else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
    }
}));
