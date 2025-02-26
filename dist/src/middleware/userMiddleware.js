"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = userMiddleware;
const jsonwebtoken_1 = require("jsonwebtoken");
const JWT_SECRET = process.env.VITE_USER_TOKEN;
function userMiddleware(req, res, next) {
    const token = req.headers['token'];
    if (token && JWT_SECRET) {
        try {
            const validToken = (0, jsonwebtoken_1.verify)(token, JWT_SECRET);
            if (validToken) {
                // @ts-ignore
                const userId = validToken.userId;
                req.id = userId;
                next();
            }
        }
        catch (e) {
            res.json({
                error: e
            });
            return;
        }
    }
    else {
        res.status(300).json({
            message: "No token provided"
        });
        return;
    }
}
