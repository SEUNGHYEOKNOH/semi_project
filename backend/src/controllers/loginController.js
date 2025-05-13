const pool = require('../models/dbpool');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, pwd } = req.body;

    if (!email || !pwd) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요' });
    }

    try {
        const sql = 'SELECT id, name, email FROM users WHERE email = ? AND pwd = ?';
        const [result] = await pool.query(sql, [email, pwd]);

        if (result.length === 0) {
            return res.status(401).json({ result: 'fail', message: '로그인 실패... 해당하는 회원 정보가 없습니다.' });
        } else {
            return res.json({ result: 'success', message: '로그인 성공', data: result });
        }
    } catch (error) {
        console.log('에러 발생 : ', error);
        return res.status(500).json({ result: 'fail', msg: error.message });
    }
};

exports.logout = async (req, res) => {
    const { email } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';

    try {
        // 사용자 존재 여부 확인
        const [result] = await pool.query(sql, [email]);

        if (result.length > 0) {
            // 사용자가 존재하면 로그아웃 성공으로 처리
            return res.json({ result: 'success', msg: '로그아웃 성공' });
        } else {
            // 사용자가 존재하지 않으면 실패로 처리
            return res.status(404).json({ result: 'fail', msg: '유효하지 않은 사용자입니다.' });
        }
    } catch (err) {
        console.error('에러 발생 : ', err);
        return res.status(500).json({ result: 'fail', msg: err.message });
    }
};
