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

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors());

// Routers
app.use('/user', userRouter);
app.use('/transaction', transactionRouter);
app.use('/teachRequest', teachRequestRouter);
app.use('/tradeRequest', tradeRequestRouter);
app.use('/meeting', meetingRouter);
app.use('/messages', messageRouter);
app.use('/skill', skillRouter);
app.use('/service', serviceRouter);
app.use('/payment', paymentRouter);

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
