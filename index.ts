import express from 'express'
import { userRouter } from './src/routes/user';
import { transactionRouter } from './src/routes/transactions';
const app = express();
app.use(express.json());
app.use('/user',userRouter);
app.use('/transaction',transactionRouter);
app.listen(3000);