import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const SurveyDetail = () => {
    const { surveyId } = useParams();
    const navigate = useNavigate();
    const [survey, setSurvey] = useState(null);
    const [responses, setResponses] = useState({});
    const [error, setError] = useState('');
    const userId = sessionStorage.getItem('userId');
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

        // 응답 데이터 포맷팅
        const formattedResponses = Object.keys(responses).map((questionId) => {
            const responseData = {
                questionId: parseInt(questionId),
            };

            if (Array.isArray(responses[questionId])) {
                responseData.choiceId = responses[questionId]; // 객관식 (배열 형태)
            } else if (responses[questionId] !== undefined && responses[questionId] !== '') {
                responseData.answer_text = responses[questionId]; // 주관식
            }

            return responseData;
        });

        console.log('변환된 응답 데이터:', formattedResponses);

        // 🚨 responses가 비어 있는지 확인
        if (formattedResponses.length === 0) {
            setError('응답을 입력해주세요.');
            console.error('🚨 오류: 응답 데이터가 없습니다.');
            return;
        }

        // 1. 설문 응답과 각 질문 응답을 함께 저장하기 위한 포맷팅
        const responsePayload = {
            surveyId,
            userId: userId, // 실제로는 사용자 ID를 동적으로 처리해야 할 수도 있음
            answers: formattedResponses,
        };

        // 2. 설문 응답 제출 API 호출
        axios
            .post(`http://localhost:5001/api/survey/${surveyId}/response`, responsePayload)
            .then(() => {
                alert('응답이 제출되었습니다!');
                navigate('/survey-List');
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
                <h2 className="text-center mb-3">🧾{survey.survey.title}</h2>
                <p className="text-center mb-4">{survey.survey.description}</p>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    {survey?.questionResult?.map((question) => (
                        <Form.Group key={question.id} className="mb-4">
                            <Form.Label>{question.question_text}</Form.Label>
                            <div>
                                {question.question_type === 'text' ? (
                                    <Form.Control
                                        type="text"
                                        placeholder="답변을 입력하세요..."
                                        value={responses[question.id] || ''}
                                        onChange={(e) => handleResponseChange(question.id, e.target.value, 'text')}
                                    />
                                ) : (
                                    question.choices?.map((choice) => (
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

export default SurveyDetail;
