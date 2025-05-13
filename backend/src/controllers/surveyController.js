const pool = require('../models/dbpool');

// 생성
exports.createSurvey = async (req, res) => {
    const { userId, title, description, questions } = req.body;

    // 필수 입력값 확인
    if (!userId || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요' });
    }

    try {
        // 1. 설문 생성
        const sql = 'INSERT INTO surveys(userId, title, description) VALUES (?, ?, ?)';
        const [result] = await pool.query(sql, [userId, title, description]);

        const surveyId = result.insertId;

        // 2. 질문, 선택지 삽입
        for (const question of questions) {
            const { question_text, question_type, choices } = question;

            if (!question_text || !question_type) {
                return res.status(400).json({ result: 'fail', message: '질문 내용과 타입을 작성하세요' });
            }

            const sql = 'INSERT INTO questions (surveyId, question_text, question_type) VALUES (?, ?, ?)';
            const [result] = await pool.query(sql, [surveyId, question_text, question_type]);
            const questionId = result.insertId;

            // 선택지가 있는 경우
            if (choices && Array.isArray(choices) && choices.length > 0) {
                for (const choice of choices) {
                    const sql = 'INSERT INTO choices (questionId, choice_text) VALUES (?, ?)';
                    await pool.query(sql, [questionId, choice]);
                }
            }
        }

        return res.json({ result: 'success', message: `설문 생성 성공! 설문 번호 : ${surveyId}` });
    } catch (error) {
        console.log('에러 발생 : ', error);
        return res.status(500).json({ result: 'fail', message: error.message });
    }
};

// 전체 조회 (제목, 설명, 작성자)
exports.getAllSurvey = async (req, res) => {
    const sql = `select id, userId, title, description, wdate from surveys order by id desc`;

    try {
        const [result] = await pool.query(sql);
        res.json({ result: 'success', surveys: result });
    } catch (error) {
        console.log('에러 발생 : ', error);
        return res.status(500).json({ result: 'fail', message: error.message });
    }
};

// 상세 조회 (질문, 선택지, 작성자)
exports.getSurvey = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        // 1. 설문 정보 조회
        const surveySql = `SELECT id, userId, title, description FROM surveys WHERE id =?`;
        const [surveyResult] = await pool.query(surveySql, [id]);

        if (surveyResult.length === 0) {
            return res.status(400).json({ result: 'fail', message: '해당하는 설문이 없습니다.' });
        }

        // 2. 질문 목록 조회
        const questionSql = `SELECT id, question_text, question_type FROM questions WHERE surveyId = ?`;
        const [questionResult] = await pool.query(questionSql, [id]);

        // 3. 선택지 조회
        for (const question of questionResult) {
            if (question.question_type !== 'text') {
                const choiceSql = `SELECT id, choice_text FROM choices WHERE questionId = ?`;
                const [choiceResult] = await pool.query(choiceSql, [question.id]);

                question.choices = choiceResult;
            } else {
                question.choices = [];
            }
        }

        return res.json({ result: 'success', survey: surveyResult[0], questionResult });
    } catch (error) {
        console.log('에러 발생 : ', error);
        return res.status(500).json({ result: 'fail', message: error.message });
    }
};

// 수정
exports.updateSurvey = async (req, res) => {
    const id = parseInt(req.params.id);
    const { userId, title, description } = req.body;

    if (!userId || !title || !description) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요' });
    }

    const surveyData = [userId, title, description, id];
    const sql = 'UPDATE surveys SET userId=?, title=?, description=? WHERE id =?';

    try {
        const [result] = await pool.query(sql, surveyData);

        if (result.affectedRows > 0) {
            return res.json({ result: 'success', message: `업데이트 성공` });
        }
        return res.json({ result: 'fail', message: '업데이트 실패' });
    } catch (err) {
        console.log('에러 발생 :', err);
        return res.status(500).json({ result: 'fail', msg: err.message });
    }
};

// 삭제
exports.deleteSurvey = async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const sql = `delete from surveys where id = ?`;
        const [result] = await pool.query(sql, [id]);

        if (result.affectedRows > 0) {
            return res.json({ result: 'success', message: '삭제 성공' });
        } else {
            return res.json({ result: 'fail', message: '삭제 실패' });
        }
    } catch (err) {
        console.log('에러 발생 : ', err);
        return res.status(500).json({ result: 'fail', msg: err.message });
    }
};

// 응답 제출 - 응답 기간, 필수 응답 체크 여부
exports.submitResponse = async (req, res) => {
    const surveyId = parseInt(req.params.id);
    const { userId, answers } = req.body;
    const maxDay = 7; // 설문 생성 후 maxDay 동안 응답 가능

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ result: 'fail', message: '응답 데이터를 입력하세요.' });
    }

    try {
        // 1. 생성 날짜 가져오기
        const surveySql = 'SELECT wdate FROM surveys WHERE id = ?';
        const [survey] = await pool.query(surveySql, [surveyId]);

        if (survey.length === 0) {
            return res.status(404).json({ result: 'fail', message: '설문을 찾을 수 없습니다.' });
        }

        const wdate = new Date(survey[0].wdate);
        const deadline = new Date(wdate);
        deadline.setDate(deadline.getDate() + maxDay);

        // 2. 마감 체크
        if (new Date() > deadline) {
            return res.status(400).json({ result: 'fail', message: '설문 응답 기간이 마감되었습니다.' });
        }

        // 3. 질문 가져오기
        const questionSql = `SELECT id FROM questions WHERE surveyId = ?`;
        const [questions] = await pool.query(questionSql, [surveyId]);

        // 4. 모든 질문이 응답되었는지 확인
        const questionIds = questions.map((q) => q.id);
        const answeredIds = answers.map((a) => a.questionId);

        const missingQuestions = questionIds.filter((qId) => !answeredIds.includes(qId));

        if (missingQuestions.length > 0) {
            return res.status(400).json({
                result: 'fail',
                message: '모든 질문에 응답해야 합니다.',
                missingQuestions,
            });
        }

        // 5. 설문 응답 저장 (`responses` 테이블)
        const responseSql = `INSERT INTO responses (surveyId, userId) VALUES (?, ?)`;
        const [responseResult] = await pool.query(responseSql, [surveyId, userId]);
        const responseId = responseResult.insertId;

        // 6. 각 질문 응답 저장 (`answers` 테이블)
        for (const answer of answers) {
            const { questionId, choiceId, answer_text } = answer;

            // 객관식일 경우, 여러 선택지를 개별적으로 삽입
            if (Array.isArray(choiceId)) {
                for (const choice of choiceId) {
                    const answerSql = `INSERT INTO answers (responseId, questionId, choiceId, answer_text) VALUES (?, ?, ?, ?)`;
                    await pool.query(answerSql, [responseId, questionId, choice, null]);
                }
            } else {
                // 주관식 또는 단일 선택
                const answerSql = `INSERT INTO answers (responseId, questionId, choiceId, answer_text) VALUES (?, ?, ?, ?)`;
                await pool.query(answerSql, [responseId, questionId, choiceId || null, answer_text || null]);
            }
        }

        return res.json({ result: 'success', message: '응답 제출 성공' });
    } catch (error) {
        console.error('응답 제출 중 에러 발생:', error);
        return res.status(500).json({ result: 'fail', message: error.message });
    }
};
exports.getResponses = async (req, res) => {
    const surveyId = parseInt(req.params.id);

    try {
        // 설문 존재 여부 확인
        const surveyCheckSql = 'SELECT * FROM surveys WHERE id = ?';
        const [survey] = await pool.query(surveyCheckSql, [surveyId]);

        if (survey.length === 0) {
            return res.status(404).json({ result: 'fail', message: '해당 설문을 찾을 수 없습니다.' });
        }

        // 설문 응답 조회
        const responseSql = `
            SELECT 
                r.id AS responseId, 
                r.userId, 
                a.questionId, 
                q.question_text, 
                q.question_type,
                a.choiceId, 
                c.choice_text, 
                a.answer_text 
            FROM responses r
            JOIN answers a ON r.id = a.responseId
            JOIN questions q ON a.questionId = q.id
            LEFT JOIN choices c ON a.choiceId = c.id
            WHERE r.surveyId = ?
            ORDER BY r.id, a.questionId;
        `;

        const [responses] = await pool.query(responseSql, [surveyId]);

        // 응답 데이터를 그룹화하여 구조화
        const groupedResponses = {};

        responses.forEach((row) => {
            if (!groupedResponses[row.responseId]) {
                groupedResponses[row.responseId] = {
                    responseId: row.responseId,
                    userId: row.userId,
                    answers: [],
                };
            }

            groupedResponses[row.responseId].answers.push({
                questionId: row.questionId,
                question_text: row.question_text,
                question_type: row.question_type,
                choiceId: row.choiceId,
                choice_text: row.choice_text,
                answer_text: row.answer_text,
            });
        });

        return res.json({
            result: 'success',
            responses: Object.values(groupedResponses),
        });
    } catch (error) {
        console.error('설문 응답 조회 중 에러 발생:', error);
        return res.status(500).json({ result: 'fail', message: error.message });
    }
};
