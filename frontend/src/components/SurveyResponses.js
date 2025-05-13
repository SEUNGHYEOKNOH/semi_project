import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const SurveyResponses = () => {
    const { id } = useParams();
    console.log('Survey ID from URL:', id); // 디버깅 로그 추가

    const surveyId = Number(id);
    const [responses, setResponses] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id || isNaN(surveyId)) {
            setError('유효하지 않은 설문 ID입니다.');
            return;
        }

        axios
            .get(`http://localhost:5001/api/survey/${surveyId}/responses`)
            .then((response) => {
                setResponses(response.data.responses);
                console.log(response.data);
                setError(null);
            })
            .catch((error) => {
                console.error('Error fetching survey responses:', error);
                setError('응답을 불러오는 중 오류가 발생했습니다.');
            });
    }, [surveyId]);

    if (error) {
        return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2>설문 응답</h2>
            <div className="accordion" id="responseAccordion">
                {responses.length > 0 ? (
                    responses.map((response, index) => (
                        <div className="accordion-item" key={index}>
                            <h2 className="accordion-header" id={`heading${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapse${index}`}
                                >
                                    사용자 ID{response.userId}의 응답
                                </button>
                            </h2>
                            <div
                                id={`collapse${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`heading${index}`}
                                data-bs-parent="#responseAccordion"
                            >
                                <div className="accordion-body">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>질문</th>
                                                <th>응답</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {response.answers.length > 0 ? (
                                                response.answers.map((answer, ansIndex) => (
                                                    <tr key={`${index}-${ansIndex}`}>
                                                        <td>{answer.question_text}</td>
                                                        <td>
                                                            {answer.choice_text || answer.answer_text || '응답 없음'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="text-center">
                                                        응답이 없습니다.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center mt-3">응답이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default SurveyResponses;
