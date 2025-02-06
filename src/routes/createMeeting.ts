import { Prisma, PrismaClient } from '@prisma/client';
import { Router } from 'express';

export const meetingRouter = Router();

const prisma = new PrismaClient();
const DYTE_API_KEY = process.env.DYTE_API;
const ORG_ID = process.env.DYTE_ORG_ID;

const DYTE_AUTH_HEADER = {
    "Authorization": `Basic ${Buffer.from(`${ORG_ID}:${DYTE_API_KEY}`).toString('base64')}`,
    "Content-Type": "application/json"
};



meetingRouter.post('/meetings', async (req, res) => {
    try {
        const response = await fetch("https://api.dyte.io/v2/meetings", {
            method: "POST",
            headers: DYTE_AUTH_HEADER,
            body: JSON.stringify({
                title: req.body.title || "My Meeting"  
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            res.status(response.status).json({
                error: "Dyte API request failed",
                details: data
            });
            return 
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('❌ Error creating meeting:', error);
        res.status(500).json({
            error: "Failed to create meeting",
            message: error
        });
    }
});

async function getValidPreset() {
    try {
        const response = await fetch("https://api.dyte.io/v2/presets", {
            method: "GET",
            headers: DYTE_AUTH_HEADER
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.data.length) {
            console.error("❌ No valid presets found in Dyte API:", data);
            null;
            return 
        }
        // ✅ Pick the first available preset
        return data.data[0].name;
         
    } catch (error) {
        console.error("❌ Error fetching presets:", error);
        null;
        return;
    }
}

meetingRouter.post('/addParticipant', async (req, res) => {
    const { meeting_id, participant_id } = req.body;
    const userid = parseInt(participant_id)
    if (!meeting_id) {
        res.status(400).json({ error: "❌ Missing meeting_id" });
        return;
    }
    
    try {
        const userName = await prisma.user.findFirst({
            where:{
                id:userid
            }
        })
        // ✅ Fetch a valid preset name dynamically
        const presetName = await getValidPreset();

        console.log(`ℹ️ Using preset: ${presetName}`);
        // ✅ Add participant with the correct preset
        const response = await fetch(`https://api.dyte.io/v2/meetings/${meeting_id}/participants`, {
            method: "POST",
            headers: DYTE_AUTH_HEADER,
            body: JSON.stringify({
                name: userName?.username || "Guest User",
                preset_name: presetName,  
                custom_participant_id: participant_id || `user-${Date.now()}`
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            res.status(response.status).json({
                error: "❌ Failed to add participant",
                details: data
            });
            return
        }

        res.status(201).json(data);
    } catch (error) {
        console.error("❌ Error adding participant:", error);
        res.status(500).json({
            error: "Failed to add participant",
            message: error
        });
    }
});
