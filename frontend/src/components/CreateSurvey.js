import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function CreateSurvey() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [questionType, setQuestionType] = useState('text'); // 기본 주관식
    const [questionText, setQuestionText] = useState('');
    const [choices, setChoices] = useState([]); // 선택지 리스트
    const [questions, setQuestions] = useState([]); // 질문 리스트
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    //임의 ID
    sessionStorage.setItem('userId', 1);
    const userId = sessionStorage.getItem('userId');

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setQuestionText('');
        setQuestionType('text');
        setChoices([]);
    };

    // 선택지 추가
    const addChoice = () => {
        setChoices([...choices, '']);
    };

    // 선택지 입력 변경
    const handleChoiceChange = (index, value) => {
        const newChoices = [...choices];
        newChoices[index] = value;
        setChoices(newChoices);
    };

    // 질문 추가
    const addQuestion = () => {
        if (!questionText) return alert('질문을 입력하세요.');

        const newQuestion = {
            question_text: questionText,
            question_type: questionType,
            choices: questionType !== 'text' ? choices : [], // 객관식만 선택지 포함
        };

        setQuestions([...questions, newQuestion]);
        handleClose();
    };

    // 설문 등록
    const submitSurvey = async () => {
        if (!title) return alert('설문 제목을 입력하세요.');
        if (questions.length === 0) return alert('최소 하나의 질문을 추가하세요.');

        const surveyData = {
            userId: parseInt(userId),
            title,
            description,
            questions,
        };

        try {
            const response = await fetch('http://localhost:5001/api/survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData),
            });
            console.log(surveyData); // 설문 데이터 형식 log

            if (response.ok) {
                alert('설문이 성공적으로 등록되었습니다!');
                setTitle('');
                setDescription('');
                setQuestions([]);
                navigate('/survey-list');
            } else {
                alert('설문 등록 실패');
            }
        } catch (error) {
            alert('서버 오류');
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">설문 만들기</h2>

            <Form.Group className="mb-3">
                <Form.Label>설문 제목</Form.Label>
                <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>설문 설명</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Form.Group>

            <Button variant="primary" onClick={handleShow}>
                질문 추가
            </Button>

            <ul className="list-group mt-3">
                {questions.map((q, index) => (
                    <li key={index} className="list-group-item">
                        <strong>{q.question_text}</strong> (
                        {q.question_type === 'text'
                            ? '주관식'
                            : q.question_type === 'multiple_choice'
                            ? '객관식(여러 개 선택)'
                            : '객관식(하나 선택)'}
                        )
                        {q.choices.length > 0 && (
                            <ul>
                                {q.choices.map((choice, i) => (
                                    <li key={i}>{choice}</li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>

            <Button className="mt-3" variant="success" onClick={submitSurvey}>
                설문 게시
            </Button>

            {/* 질문 추가 모달 */}
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>질문 추가</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>질문 내용</Form.Label>
                        <Form.Control
                            type="text"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mt-3">
                        <Form.Label>질문 유형</Form.Label>
                        <Form.Select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                            <option value="text">주관식</option>
                            <option value="multiple_choice">객관식 (N개 선택)</option>
                            <option value="single_choice">객관식 (하나 선택)</option>
                        </Form.Select>
                    </Form.Group>

                    {questionType !== 'text' && (
                        <div className="mt-3">
                            <Form.Label>선택지</Form.Label>
                            {choices.map((choice, index) => (
                                <Form.Control
                                    key={index}
                                    type="text"
                                    className="mt-2"
                                    value={choice}
                                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                                />
                            ))}
                            <Button variant="secondary" className="mt-2" onClick={addChoice}>
                                선택지 추가
                            </Button>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        취소
                    </Button>
                    <Button variant="primary" onClick={addQuestion}>
                        추가
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

// 데이터 전송 형태 (예시)
// {
//     "userId": 1,
//     "title": "나의 생활 습관",
//     "description": "생활 습관 관련 설문입니다.",
//     "questions": [
//       {
//         "question_text": "나의 성별은?",
//         "question_type": "multiple_choice",
//         "choices": ["남성", "여성"]
//       },
//       {
//         "question_text": "이름을 적으시오",
//         "question_type": "text",
//         "choices": []
//       },
//       {
//         "question_text": "나는 내 인생에 만족한다",
//         "question_type": "single_choice",
//         "choices": ["예", "아니오"]
//       }
//     ]
//   }
