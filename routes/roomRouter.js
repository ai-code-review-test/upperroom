const express = require('express');
const router = express.Router();
const userSchema = require('../model/user');
const harinSchema = require('../model/harini');
const axios = require('axios');
const cors = require('cors');  // cors 추가

// CORS 설정
// const corsOptions = {
//     origin: ['http://101.79.10.182:3000', 'http://101.79.10.182','http://34.64.123.146'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
//     credentials: true
// };

// 모든 room 라우터에 CORS 적용
// router.use(cors(corsOptions));


// 라우터 설정
router.get('/', async (req, res) => {
    const userid = 'dev.dn@teamremited.com';
    const user = await userSchema.findOne({ email: userid });
    const harini = await harinSchema.findOne({ email: userid });
    // console.log(userid);

    // 현재 레벨에 필요한 경험치 계산
    const requiredExp = getRequiredExp(harini.level);

    console.log(harini);
    return res.json({
        message: "하리니 기본 정보",
        harini: {
            email: harini.email,
            food: harini.food,
            exp: harini.exp,
            level: harini.level,
            color: harini.color,
            name: harini.name,
            hasLists: harini.hasLists,
            requiredExp: requiredExp,
            evolved: false
        }
    });;  
 // json 대신 send를 사용하여 텍스트 응답
});

router.put('/updateName', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        const updatedHarini = await harinSchema.findOneAndUpdate(
            { email: email },
            { name: name },
            { new: true }
        );

        if (!updatedHarini) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        res.json({ message: '이름이 성공적으로 수정되었습니다.', harini: updatedHarini });
    } catch (error) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
});
router.put('/feed', async (req, res) => {
    try {
        console.log('feed 시작');
        const { email } = req.body;

        let harini = await harinSchema.findOne({ email });
        
        if (!harini) {
            return res.status(404).json({ message: '하리니를 찾을 수 없습니다.' });
        }

        if (harini.food <= 0) {
            return res.status(400).json({ message: '배불러' });
        }

        // 밥을 1개 감소시키고 경험치 증가
        const harinifood = await harinSchema.findOneAndUpdate(
            { email },
            { 
                $inc: { 
                    food: -100,
                    exp: 20,
                }
            },
            { new: true }
        );
    
        
        // 레벨업 체크
        const levelUpResult = await checkLevelUp(email);
        console.log('레벨업 체크 결과:', levelUpResult);

         // 레벨업이 발생한 경우
         if (levelUpResult && levelUpResult.levelUp) {
            console.log('레벨업 발생!');
            return res.json({
                message: "하리니 진화 완료!",
                harini: {
                    evolved: levelUpResult.evolved,
                    exp: 0 , // 레벨업 시 exp 0으로 초기화
                    email: harinifood.email,
                    food: levelUpResult.food,
                    exp: levelUpResult.exp,
                    level: levelUpResult.level,
                    name: harinifood.name,
                    requiredExp: levelUpResult.requiredExp
                }
            });
        }
        
        // 레벨업이 발생하지 않은 경우
        const requiredExp = getRequiredExp(harinifood.level);
        const expToNextLevel = requiredExp - harinifood.exp;
        console.log('expToNextLevel',expToNextLevel);

        // await harinSchema.findOneAndUpdate(
        //     { email },
        //     { 
        //         $set: { 
        //             requiredExp: expToNextLevel,
        //         }
        //     }
        // );


        res.json({ 
            message: `배고파`,
            harini: {
                email: harini.email,
                food: harinifood.food,
                exp: harinifood.exp,
                level: harinifood.level,
                name: harini.name,
                requiredExp: expToNextLevel,
                evloved: false
            }
        });
    } catch (error) {
        console.error('에러 발생:', error);
        res.status(500).json({ 
            message: '서버 오류', 
            error: error.message 
        });
    }
});


// 레벨업 체크 함수
async function checkLevelUp(email) {
    try {
        console.log('checkLevelUp 시작 ');
        const userid = 'dev.dn@teamremited.com';
        const harini = await harinSchema.findOne({ email: userid });
        if (!harini) return null;

        const requiredExp = getRequiredExp(harini.level);
        console.log('필요 경험치:', requiredExp);

        if (harini.exp >= requiredExp) {
            console.log('레벨업 조건 충족!');
            const updatedHarini = await harinSchema.findOneAndUpdate(
                { email: userid },
                { 
                    $inc: { level: 1 },
                    $set: { 
                        exp: 0,
                        evolved: true,

                    }
                },
                { new: true }
            );
            const newRequiredExp = getRequiredExp(updatedHarini.level);
            return {
                levelUp: true,
                level: updatedHarini.level,
                evolved: updatedHarini.evolved,
                exp: updatedHarini.exp,
                food: updatedHarini.food,
                requiredExp: newRequiredExp
            };
        }

        // 레벨업이 안 된 경우 리턴
        return {
            levelUp: false,
            evolved: false
        };
        
    } catch (error) {
        console.error('레벨업 체크 오류:', error);
        return null;
    }
}

// 레벨별 필요 경험치 계산 함수
function getRequiredExp(level) {
    // 새로운 레벨업 정책 적용
    if (level === 1) return 15;      // 1->2: 15
    if (level === 2) return 40;      // 2->3: 40
    if (level === 3) return 100;     // 3->4: 100
    if (level === 4) return 160;     // 4->5: 160
    if (level >= 5 && level <= 9) {  // 5->6->7->8->9->10: 220, 280, 340, 400, 460 (60씩 증가)
        return 160 + (level - 4) * 60;
    }
    if (level >= 10 && level <= 19) { // 10->11->...->19->20: 100씩 증가
        return 460 + (level - 9) * 100;
    }
    return 1560 + (level - 19) * 150; // 20레벨 이상: 150씩 증가
}


router.get('/randomLists', async (req, res) => {
    try {
        const userid = 'dev.dn@teamremited.com';
        const harini = await harinSchema.findOne({ email: userid });
    
        // shopItems에서 id가 101~104인 아이템만 필터링
        const filteredItems = harini.shopLists.filter(item => 
            item.id >= 1 && item.id <= 4
        );

        // 디버깅을 위해 하리니 객체 출력
        console.log('하리니 객체:', harini);
        
        if (filteredItems.length === 0) {
            return res.status(404).json({ 
                message: 'ID가 10~104인 아이템이 없습니다.' 
            });
        }
        
        // 꽝 아이템 추가
        const loseItem = {
            type: 'none',
            name: '꽝',
            code: '0',
            id: 999
        };
        
        // 60% 확률로 꽝 선택, 40% 확률로 실제 아이템 선택
        let selectedItem;
        const randomValue = Math.random(); // 0~1 사이의 랜덤 값
        
        if (randomValue < 0.6) {
            // 60% 확률로 꽝 선택
            selectedItem = loseItem;
            console.log('꽝이 선택되었습니다. (확률: 60%)');
        } else {
            // 40% 확률로 실제 아이템 선택
            const randomIndex = Math.floor(Math.random() * filteredItems.length);
            selectedItem = filteredItems[randomIndex];
            console.log('아이템이 선택되었습니다. (확률: 40%)');
        }
        
        console.log('선택된 랜덤 아이템:', selectedItem); // 디버깅용
       
        // 하리니 진화 및 아이템 지급 (꽝이 아닌 경우에만 저장)
        if (selectedItem.id !== 999) {
            await harinSchema.findOneAndUpdate(
                { email: userid },
                { 
                    $set: { 
                        randomLists: [selectedItem]  // 배열로 감싸서 1개만 저장
                    }
                },
                { new: true }
            );
        }

        // 사용자에게 알림
        res.json({ 
            message: '하리니 진급 아이템',
            harini: { randomLists: selectedItem }  // 배열이 아닌 객체 하나만 반환
        });
    } catch (error) {
        console.error('랜덤 아이템 지급 오류:', error);
        res.status(500).json({ 
            message: '랜덤 아이템 지급 중 오류가 발생했습니다.', 
            error: error.message 
        });
    }
});


router.put('/getitem', async (req, res) => {
    try {
        const { type, name, code, id } = req.body;
        const userid = 'dev.dn@teamremited.com';
        
        // let 키워드로 변수 선언
        let formattedItem = {
            type: type,
            name: name,
            code: code,
            id: id
        };
        
        console.log(formattedItem);
        
        // itemLists에 새 아이템 추가
        const updatedHarini = await harinSchema.findOneAndUpdate(
            { email: userid },
            { $addToSet: { itemLists: formattedItem }},
            { new: true }
        );
        
        if (!updatedHarini) {
            return res.status(404).json({ message: '하리니를 찾을 수 없습니다.' });
        }
        
        // 업데이트된 하리니의 itemLists 반환
        res.json({ 
            message: '하리니 아이템 추가', 
            harini: { itemLists: updatedHarini.itemLists } 
        });
    } catch (error) {
        console.error('아이템 추가 오류:', error);
        res.status(500).json({ 
            message: '아이템 추가 중 오류가 발생했습니다.', 
            error: error.message 
        });
    }
});

router.get('/closet', async (req, res) => {
    const userid = 'dev.dn@teamremited.com';
    const user = await userSchema.findOne({ email: userid });
    const harini = await harinSchema.findOne({ email: userid });
    
    // itemLists를 일반 객체로 변환
    const itemLists = harini.itemLists.toObject();
    const itemListsWithIsWear = [];

    // Object.values()를 사용하여 객체를 배열로 변환하고 순회
    Object.values(itemLists).forEach(item => {
        // hasLists에서 같은 type과 id를 가진 아이템이 있는지 확인
        const isWear = harini.hasLists.some(hasItem => 
            hasItem.type === item.type && 
            Number(hasItem.id) === Number(item.id)
        );

        // 새로운 객체를 만들어 배열에 추가
        itemListsWithIsWear.push({
            ...item,
            isWear: isWear
        });
    });

    console.log('Updated itemLists:', itemListsWithIsWear);
    
    res.json({ 
        message: '하리니 아이템 리스트', 
        harini: {
            itemLists: itemListsWithIsWear 
        } 
    });
});  
router.put('/wearitem', async (req, res) => {
    try {
        const { type, id } = req.body;
        const userid = 'dev.dn@teamremited.com';
        const harini = await harinSchema.findOne({ email: userid });

        // MongoDB Document를 일반 객체로 변환
        const itemLists = harini.itemLists.toObject();
        console.log('변환된 itemLists:', itemLists);

        // 변환된 itemLists에서 아이템 찾기
        const foundItem = Object.values(itemLists).find(item => 
            item.type === type && Number(item.id) === Number(id)
        );

        if (!foundItem) {
            return res.status(404).json({ message: '아이템을 찾을 수 없습니다.' });
        }

        // 현재 hasLists 가져오기
        let currentHasLists = Array.isArray(harini.hasLists) ? harini.hasLists : [];
        
        // 같은 type의 아이템이 있는지 확인
        const existingItemIndex = currentHasLists.findIndex(item => item.type === type);
        
        if (existingItemIndex !== -1) {
            // 같은 type의 아이템이 있으면 교체
            currentHasLists[existingItemIndex] = foundItem;
        } else {
            // 없으면 새로 추가
            currentHasLists.push(foundItem);
        }

        // hasLists 업데이트
        await harinSchema.findOneAndUpdate(
            { email: userid },
            { $set: { hasLists: currentHasLists } },
            { new: true }
        );

        // 업데이트된 하리니 정보 가져오기
        const updatedHarini = await harinSchema.findOne({ email: userid });

        res.json({
            message: '아이템 착용 완료',
            harini: { hasLists: updatedHarini.hasLists }
        });
    } catch (error) {
        console.error('에러:', error);
        res.status(500).json({ message: '오류가 발생했습니다.' });
    }
});

router.put('/removeitem', async (req, res) => {
    try {
        const { type, id } = req.body;
        const userid = 'dev.dn@teamremited.com';
        const harini = await harinSchema.findOne({ email: userid });

        // hasLists에서 해당 아이템 제거
        await harinSchema.findOneAndUpdate(
            { email: userid },
            { 
                $pull: { 
                    hasLists: { 
                        type: type, 
                        id: Number(id) 
                    } 
                } 
            },
            { new: true }
        );

        // 업데이트된 하리니 정보 가져오기
        const updatedHarini = await harinSchema.findOne({ email: userid });

        res.json({
            message: '아이템 해제 완료',
            harini: { hasLists: updatedHarini.hasLists }
        });
    } catch (error) {
        console.error('에러:', error);
        res.status(500).json({ message: '아이템 해제 중 오류가 발생했습니다.' });
    }
});

// food 리필 라우터 추가
router.get('/food', async (req, res) => {
    try {
        const userid = 'dev.dn@teamremited.com';
        
        // food 100 증가
        const updatedHarini = await harinSchema.findOneAndUpdate(
            { email: userid },
            { 
                $inc: { food: 100 }  // food 100 증가
            },
            { new: true }
        );

        if (!updatedHarini) {
            return res.status(404).json({ message: '하리니를 찾을 수 없습니다.' });
        }

        res.json({ 
            message: '밥 리필 완료!',
            harini: {
                food: updatedHarini.food,
                exp: updatedHarini.exp,
                level: updatedHarini.level,
                name: updatedHarini.name,
                evolved: false
            }
        });
    } catch (error) {
        console.error('밥 리필 오류:', error);
        res.status(500).json({ 
            message: '밥 리필 중 오류가 발생했습니다.', 
            error: error.message 
        });
    }
});

// 라우터를 export 합니다
module.exports = router;
