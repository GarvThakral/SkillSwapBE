import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import { userRouter } from './src/routes/user';
import { transactionRouter } from './src/routes/transactions';
import { skillRouter } from './src/routes/skills';
import { serviceRouter } from './src/routes/serviceRequest';
import { teachRequestRouter } from './src/routes/teachRequest';
import { tradeRequestRouter } from './src/routes/tradeRequest';
import { messageRouter } from './src/routes/message';
import { meetingRouter } from './src/routes/createMeeting';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use('/user', userRouter);
app.use('/transaction', transactionRouter);
app.use('/teachRequest', teachRequestRouter);
app.use('/tradeRequest', tradeRequestRouter);
app.use('/meeting', meetingRouter);
app.use('/messages', messageRouter);
app.use('/skill', skillRouter);
app.use('/service', serviceRouter);

app.get('/', (req, res) => {
    res.send('HTTP API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP Server running on port ${PORT}`));
