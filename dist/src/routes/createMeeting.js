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
exports.meetingRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
exports.meetingRouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const DYTE_API_KEY = process.env.DYTE_API;
const ORG_ID = process.env.DYTE_ORG_ID;
const DYTE_AUTH_HEADER = {
    "Authorization": `Basic ${Buffer.from(`${ORG_ID}:${DYTE_API_KEY}`).toString('base64')}`,
    "Content-Type": "application/json"
};
exports.meetingRouter.post('/meetings', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("https://api.dyte.io/v2/meetings", {
            method: "POST",
            headers: DYTE_AUTH_HEADER,
            body: JSON.stringify({
                title: req.body.title || "My Meeting"
            }),
        });
        const data = yield response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: "Dyte API request failed",
                details: data
            });
        }
        res.status(201).json(data);
    }
    catch (error) {
        console.error('❌ Error creating meeting:', error);
        res.status(500).json({
            error: "Failed to create meeting",
            message: error.message
        });
    }
}));
function getValidPreset() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("https://api.dyte.io/v2/presets", {
                method: "GET",
                headers: DYTE_AUTH_HEADER
            });
            const data = yield response.json();
            if (!response.ok || !data.success || !data.data.length) {
                console.error("❌ No valid presets found in Dyte API:", data);
                return null;
            }
            // ✅ Pick the first available preset
            return data.data[0].name;
        }
        catch (error) {
            console.error("❌ Error fetching presets:", error);
            return null;
        }
    });
}
exports.meetingRouter.post('/addParticipant', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { meeting_id, participant_id } = req.body;
    const userid = parseInt(participant_id);
    if (!meeting_id) {
        return res.status(400).json({ error: "❌ Missing meeting_id" });
    }
    try {
        const userName = yield prisma.user.findFirst({
            where: {
                id: userid
            }
        });
        // ✅ Fetch a valid preset name dynamically
        const presetName = yield getValidPreset();
        if (!presetName) {
            return res.status(500).json({ error: "❌ No valid preset found in Dyte" });
        }
        console.log(`ℹ️ Using preset: ${presetName}`);
        // ✅ Add participant with the correct preset
        const response = yield fetch(`https://api.dyte.io/v2/meetings/${meeting_id}/participants`, {
            method: "POST",
            headers: DYTE_AUTH_HEADER,
            body: JSON.stringify({
                name: (userName === null || userName === void 0 ? void 0 : userName.username) || "Guest User",
                preset_name: presetName,
                custom_participant_id: participant_id || `user-${Date.now()}`
            }),
        });
        const data = yield response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: "❌ Failed to add participant",
                details: data
            });
        }
        res.status(201).json(data);
    }
    catch (error) {
        console.error("❌ Error adding participant:", error);
        res.status(500).json({
            error: "Failed to add participant",
            message: error.message
        });
    }
}));
