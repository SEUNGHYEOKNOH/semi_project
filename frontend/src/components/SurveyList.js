import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SurveyList = () => {
    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        axios
            .get('http://localhost:5001/api/survey')
            .then((response) => {
                console.log('Received surveys:', response.data.surveys);
                setSurveys(response.data.surveys);
            })
            .catch((error) => {
                console.error('API 호출 오류:', error);
                if (error.response) {
                    console.error('Response Error:', error.response.data);
                    console.error('Response Status:', error.response.status);
                } else if (error.request) {
                    console.error('Request Error:', error.request);
                } else {
                    console.error('Error Message:', error.message);
                }
            });
    }, []);

    const containerStyle = {
        padding: '20px',
        backgroundColor: '#f8f9fa',
    };

    const headingStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
    };

    const buttonStyle = {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        cursor: 'pointer',
        borderRadius: '4px',
        marginLeft: '10px',
    };

    const listStyle = {
        listStyleType: 'none',
        padding: '0',
    };

    const listItemStyle = {
        marginBottom: '15px',
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    };

    const linkStyle = {
        textDecoration: 'none',
        color: '#007bff',
    };

    const textStyle = {
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#333',
    };

    const titleStyle = {
        fontWeight: 'bold',
        fontSize: '18px',
    };

    const descriptionStyle = {
        color: '#555',
    };

    const dateStyle = {
        fontSize: '14px',
        color: '#777',
    };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>
                설문조사 글
                <Link to="/createsurvey">
                    <button style={buttonStyle}>등록</button>
                </Link>
            </h2>
            <hr />
            <ul style={listStyle}>
                {surveys.map((survey) => (
                    <li key={survey.id} style={listItemStyle}>
                        <Link to={`/surveys/${survey.id}`} style={linkStyle}>
                            <p style={textStyle}>
                                <span style={titleStyle}>설문 제목:</span> {survey.title} <br />
                                <span style={descriptionStyle}>설명:</span> {survey.description} <br />
                                <span style={dateStyle}>등록일:</span> {new Date(survey.wdate).toLocaleDateString()}
                            </p>
                            <Link to={`/response/${survey.id}`}>
                                <button className="btn btn-success">응답</button>
                            </Link>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SurveyList;
