import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import { userRouter } from './routes/user';
import { transactionRouter } from './routes/transactions';
import { skillRouter } from './routes/skills';
import { serviceRouter } from './routes/serviceRequest';
import { teachRequestRouter } from './routes/teachRequest';
import { tradeRequestRouter } from './routes/tradeRequest';
import { messageRouter } from './routes/message';
import { meetingRouter } from './routes/createMeeting';
import { paymentRouter } from './routes/payment';

export const app = express();
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
app.use('/payment', paymentRouter);

app.get('/', (req, res) => {
    res.send('HTTP API is running');
});


app.listen(3000, () => console.log(`HTTP Server running on port 3000`));
