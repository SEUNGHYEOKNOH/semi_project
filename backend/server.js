const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//라우트 가져오기
const loginRouter = require('./src/routes/loginRouter');
const surveyRouter = require('./src/routes/surveyRouter');
const userRouter = require('./src/routes/userRouter');

//api 연결
app.use('/api/auth', loginRouter);
app.use('/api/survey', surveyRouter);
app.use('/api/users', userRouter);

// 서버 가동
const port = 5001;
app.listen(port, () => console.log(`✅ 백엔드 서버 실행 중! (포트 ${port})`));
