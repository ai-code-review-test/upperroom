const express = require('express');
const router = express.Router();
const userSchema = require('../model/user');
const harinSchema = require('../model/harini');
const cors = require('cors');  // cors 추가

// CORS 설정
// const corsOptions = {
//     origin: ['http://101.79.10.182:3000', 'http://101.79.10.182','http://34.64.123.146'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
//     credentials: true
// };
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

router.get('/buy', async (req, res) => {
    const userid = 'dev.dn@teamremited.com';
    const user = await userSchema.findOne({ email: userid });
    const harini = await harinSchema.findOne({ email: userid });
    const points = user.points;
    const color = harini.color;
    console.log(points); // user 객체의 points 값을 출력합니다
    res.json({ 
        message: '샵 구매',
        harini: {
            points: points,
            color: color
        }
    });
});

// 아이템 초기화 라우터 추가
router.get('/init-shop-items', async (req, res) => {
    try {
        const userid = 'dev.dn@teamremited.com';
        
        // 아이템 목록
        const shopLists = [
            {
                type: 'sunglasses',
                name: '작은 선글라스',
                code: '#FF0000',
                id: 1
            },
            {
                type: 'sunglasses',
                name: '멋진 선글라스',
                code: '#0000FF',
                id: 2
            },
            {
                type: 'hat',
                name: '한정판 모자',
                code: '#00FF00',
                id: 3
            },
            {
                type: 'hat',
                name: '귀여운 모자',
                code: '1',
                id: 4
            },
            {
                type: 'color',
                name: '검정',
                code: '#000000',
                id: 5
            },
            {
                type: 'color',
                name: '흰색',
                code: '#FFFFFF',
                id: 6
            },
            {
                type: 'color',
                name: '빨강',
                code: '#FF0000',
                id: 7
            },
            {
                type: 'color',
                name: '파랑',
                code: '#0000FF',
                id: 8
            }
        ];
        
        // 하리니 스키마에 아이템 리스트 추가
        const updatedHarini = await harinSchema.findOneAndUpdate(
            { email: userid },
            { $set: { shopLists: shopLists } },
            { new: true }
        );
        
        if (!updatedHarini) {
            return res.status(404).json({ message: '하리니를 찾을 수 없습니다.' });
        }
        
        res.json({ 
            message: '상점 아이템이 하리니 스키마에 추가되었습니다.',
            harini: { shopLists: updatedHarini.shopLists }
        });
    } catch (error) {
        console.error('아이템 초기화 오류:', error);
        res.status(500).json({ 
            message: '아이템 초기화 중 오류가 발생했습니다.', 
            error: error.message 
        });
    }
});

// 기존 item 라우터 수정
router.get('/item', async (req, res) => {
    try {
        const userid = 'dev.dn@teamremited.com';
        const harini = await harinSchema.findOne({ email: userid });
        
        // 쿼리 파라미터에서 type 가져오기
        const typeFilter = req.query.type;
        
        if (!harini) {
            return res.status(404).json({ message: '하리니를 찾을 수 없습니다.' });
        }
        
        // 하리니 스키마에서 shopLists 가져오기
        let shopLists = harini.shopLists || [];  // const 대신 let 사용
        
        // type 파라미터가 있으면 해당 타입으로 필터링
        if (typeFilter) {
            shopLists = shopLists.filter(item => item.type === typeFilter);
            console.log(`타입 '${typeFilter}'으로 필터링된 아이템 목록:`, shopLists);
        } else {
            console.log('전체 상점 아이템 목록:', shopLists);
        }
        
        res.json({ 
            message: typeFilter ? `${typeFilter} 타입 아이템 리스트` : '상점 아이템 리스트',
            harini: { shopLists: shopLists }
        });
    } catch (error) {
        console.error('아이템 조회 오류:', error);
        res.status(500).json({ 
            message: '아이템 조회 중 오류가 발생했습니다.', 
            error: error.message 
        });
    }
});

module.exports = router;