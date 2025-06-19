const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const roomRouter = require('./routes/roomRouter');
const shopRouter = require('./routes/shopRouter');
const expRouter = require('./routes/expRouter');
const dbconnect = require('./model/mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

console.log('good!');

dbconnect();
// JSON 파싱을 위한 미들웨어
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.send('하리니 키우기 서버입니다~');
});

app.use('/room',roomRouter);
app.use('/shop',shopRouter);
app.use('/exp',expRouter);

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다`);
});
