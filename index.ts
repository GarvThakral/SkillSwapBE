import express from 'express'
import { userRouter } from './src/routes/user';
import { transactionRouter } from './src/routes/transactions';
import { skillRouter } from './src/routes/skills';
import { serviceRouter } from './src/routes/serviceRequest';
import cors from 'cors'
import { WebSocketServer } from 'ws'
import { teachRequestRouter } from './src/routes/teachRequest';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/user',userRouter);
app.use('/transaction',transactionRouter);
app.use('/teachRequest',teachRequestRouter);
app.use('/skill',skillRouter)
app.use('/service',serviceRouter);



app.listen(3000);