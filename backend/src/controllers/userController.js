const pool = require('../models/dbpool');

// 회원가입
exports.createUser = async (req, res) => {
    const { name, email, pwd } = req.body;

    if (!name || !email || !pwd) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요' });
    }

    const userData = [name, email, pwd];
    const sql = 'INSERT INTO users(name, email, pwd) VALUES(?,?,?)';

    try {
        const [result] = await pool.query(sql, userData);
        console.log('결과 :', result);

        if (result.affectedRows > 0) {
            return res.json({ result: 'success', message: `등록 성공! 회원번호는 ${result.insertId}번 입니다.` });
        } else {
            return res.json({ result: 'fail', message: '등록 실패' });
        }
    } catch (error) {
        console.log('에러 발생 : ', error);
        return res.status(500).json({ result: 'fail', message: error.message });
    }
};

//모든 회원 조회
exports.getAllUsers = async (req, res) => {
    const sql = `select id,name,email from users order by id desc`;

    try {
        const [result] = await pool.query(sql);
        res.json({ result: 'success', users: result });
    } catch (error) {
        console.log('에러 발생 : ', error);
        return res.status(500).json({ result: 'fail', message: error.message });
    }
};

//특정 회원 조회
exports.getUser = async (req, res) => {
    try {
        const sql = `select * from users where id = ?`;
        const { id } = req.params;
        const [result] = await pool.query(sql, [id]);

        if (result.length === 0) {
            return res.status(404).json({ result: 'fail', msg: '해당하는 회원정보가 없습니다.' });
        }

        res.json({ result: 'success', user: result[0] });
    } catch (err) {
        return res.status(500).json({ result: 'fail', message: err.message });
    }
};

//회원정보 수정
exports.updateUser = async (req, res) => {
    const { name, email, pwd } = req.body;
    const { id } = req.params;

    if (!name || !email || !pwd) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요' });
    }

    const userData = [name, email, pwd, id];
    const sql = 'update users set name = ?, email = ?, pwd = ? where id = ?';

    try {
        const [result] = await pool.query(sql, userData);

        if (result.affectedRows > 0) {
            return res.json({ result: 'success', message: `업데이트 성공` });
        } else {
            return res.json({ result: 'fail', message: '업데이트 실패' });
        }
    } catch (error) {
        console.log('에러 발생 : ', error);
        return res.status(500).json({ result: 'fail', msg: error.message });
    }
};

//회원정보 삭제
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `delete from users where id = ?`;
        const [result] = await pool.query(sql, [id]);
        if (result.affectedRows > 0) {
            return res.json({ result: 'success', message: `삭제 성공` });
        } else {
            return res.json({ result: 'fail', message: '삭제 실패' });
        }
    } catch (err) {
        console.log('에러 발생 : ', err);
        return res.status(500).json({ result: 'fail', message: err.message });
    }
};

// 중복 체크
exports.duplicatedEmail = async (req, res) => {
    const { email } = req.body; //post,put

    if (!email) {
        return res.status(400).json({ message: '이메일을 입력해주세요' });
    }

    try {
        const sql = `select id from users where email =?`;
        const [result] = await pool.query(sql, [email]);

        if (result.length > 0) {
            return res.json({ result: 'fail', message: '중복된 이메일입니다.' });
        }
        return res.json({ result: 'success', message: '사용가능한 이메일입니다.' });
    } catch (err) {
        console.log('에러 발생 : ', err);
        return res.status(500).json({ result: 'fail', message: err.message });
    }
};
