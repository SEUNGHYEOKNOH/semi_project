import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const SurveyResponse = () => {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [responses, setResponses] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        axios
            .get(`http://localhost:5001/api/survey/${surveyId}`)
            .then((response) => {
                console.log('Survey Data:', response.data);
                setSurvey(response.data);
            })
            .catch((error) => {
                console.error('설문 조회 오류:', error);
                setError('설문 정보를 불러오는 데 실패했습니다.');
            });
    }, [surveyId]);

    // ✅ 응답 상태 업데이트 함수
    const handleResponseChange = (questionId, value, type) => {
        setResponses((prevResponses) => {
            if (type === 'single_choice') {
                return { ...prevResponses, [questionId]: [value] }; // 단일 선택
            } else if (type === 'multiple_choice') {
                const selectedChoices = prevResponses[questionId] || [];
                const updatedChoices = selectedChoices.includes(value)
                    ? selectedChoices.filter((id) => id !== value) // 체크 해제
                    : [...selectedChoices, value]; // 체크 추가
                return { ...prevResponses, [questionId]: updatedChoices };
            } else if (type === 'text') {
                console.log('주관식 응답 저장:', value);
                return { ...prevResponses, [questionId]: value }; // 주관식 텍스트 저장
            } else {
                return prevResponses;
            }
        });
    };

    // ✅ 응답 제출 함수
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        console.log('제출할 응답 데이터:', responses);

        const formattedResponses = Object.keys(responses).map((questionId) => {
            const responseData = {
                questionId: parseInt(questionId),
            };

            if (Array.isArray(responses[questionId])) {
                responseData.choiceId = responses[questionId]; // 객관식 (배열 형태)
            } else {
                responseData.answer_text = responses[questionId]; // 주관식
            }

            return responseData;
        });

        axios
            .post(`http://localhost:5000/api/surveys/${surveyId}/submit`, { responses: formattedResponses })
            .then(() => {
                alert('응답이 제출되었습니다!');
                navigate('/SurveyList');
            })
            .catch((error) => {
                console.error('응답 제출 오류:', error);
                setError('응답을 제출하는 데 실패했습니다.');
            });
    };

    if (!survey) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <div>로딩중...</div>
            </Container>
        );
    }

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="p-4 shadow" style={{ width: '500px' }}>
                <h2 className="text-center mb-3">{survey.title} 설문조사</h2>
                <p className="text-center mb-4">{survey.description}</p>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    {survey.questions.map((question) => (
                        <Form.Group key={question.id} className="mb-4">
                            <Form.Label>{question.question_text}</Form.Label>
                            <div>
                                {question.question_type === 'text' ? (
                                    // ✅ 주관식 (텍스트 입력)
                                    <Form.Control
                                        type="text"
                                        placeholder="답변을 입력하세요..."
                                        value={responses[question.id] || ''} // 텍스트 입력값
                                        onChange={(e) => handleResponseChange(question.id, e.target.value, 'text')}
                                    />
                                ) : (
                                    // ✅ 객관식 (단일 선택, 다중 선택)
                                    question.choices.map((choice) => (
                                        <Form.Check
                                            key={choice.id}
                                            type={question.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                                            name={`question-${question.id}`}
                                            label={choice.choice_text}
                                            value={choice.id}
                                            onChange={() =>
                                                handleResponseChange(question.id, choice.id, question.question_type)
                                            }
                                            checked={
                                                question.question_type === 'multiple_choice'
                                                    ? responses[question.id]?.includes(choice.id)
                                                    : responses[question.id]?.[0] === choice.id
                                            }
                                        />
                                    ))
                                )}
                            </div>
                        </Form.Group>
                    ))}
                    <Button variant="primary" type="submit" className="w-100">
                        응답 제출
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default SurveyResponse;
