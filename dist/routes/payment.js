"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = require("express");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const client_1 = require("@prisma/client");
const key_id = process.env.RAZOR_KEY_ID ?? "";
const key_secret = process.env.RAZOR_KEY_SECRET ?? "";
var instance = new razorpay_1.default({
    key_id,
    key_secret
});
const prisma = new client_1.PrismaClient();
exports.paymentRouter = (0, express_1.Router)();
exports.paymentRouter.post("/create-order", async (req, res) => {
    const options = {
        amount: req.body.amount * 100,
        currency: "INR",
        receipt: "receipt#1",
    };
    try {
        const order = await instance.orders.create(options);
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
exports.paymentRouter.post("/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;
    const intId = parseInt(userId);
    const hmac = crypto_1.default.createHmac("sha256", key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");
    if (generatedSignature === razorpay_signature) {
        res.json({ success: true, message: "Payment verified" });
        const paymentDetails = await instance.orders.fetch(razorpay_order_id);
        console.log(paymentDetails);
        let tokensInc;
        if (Number(paymentDetails.amount) / 100 == 1999) {
            tokensInc = 500;
        }
        else {
            tokensInc = Number(paymentDetails.amount) / 500;
        }
        const updatedUser = await prisma.user.update({
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
});
