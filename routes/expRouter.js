const express = require('express');
const router = express.Router();
const userSchema = require('../model/user');
const harinSchema = require('../model/harini');

// 라우터 설정
router.get('/', async (req, res) => {
    const userid = 'dev.dn@teamremited.com';
    const user = await userSchema.findOne({ email: userid });
    const harini = await harinSchema.findOne({ email: userid });
    // console.log(userid);
    console.log(harini);
    res.json({ message: '하라니 기본 정보', 
        harini: harini });  
 // json 대신 send를 사용하여 텍스트 응답
});


module.exports = router;