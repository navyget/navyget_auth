import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import './config/config';
import { mongoose } from './db/mongoose';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/navyget-api/v1/auth', authRoutes);

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
