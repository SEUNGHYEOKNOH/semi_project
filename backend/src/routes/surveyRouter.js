const express = require('express');
const router = express.Router();
const {
    createSurvey,
    getAllSurvey,
    getSurvey,
    updateSurvey,
    deleteSurvey,
    submitResponse,
    getResponses,
} = require('../controllers/surveyController');

router.post('/', createSurvey); // 생성
router.get('/', getAllSurvey); // 전체 조회
router.get('/:id', getSurvey); // 상세 조회
router.put('/:id', updateSurvey); // 수정
router.delete('/:id', deleteSurvey); // 삭제

router.post('/:id/response', submitResponse); // 응답 제출
router.get('/:id/responses', getResponses); //응답 조회

module.exports = router;
