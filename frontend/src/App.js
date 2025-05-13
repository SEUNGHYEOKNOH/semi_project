import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Register from './components/Register';
import CreateSurvey from './components/CreateSurvey';
import SurveyList from './components/SurveyList';
import SurveyDetails from './components/SurveyDetails';
import SurveyResponse from './components/SurveyResponse';
import SurveyResponses from './components/SurveyResponses';

export default function App() {
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    useEffect(() => {
        const storedUserId = sessionStorage.getItem('userId');
        const storedUserName = sessionStorage.getItem('userName');

        if (storedUserId) setUserId(storedUserId);
        if (storedUserName) setUserName(storedUserName);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');
        setUserName(null);
        setUserId(null);
        window.location.href = '/login';
    };

    return (
        <Router>
            <div className="container mt-5 text-center">
                <h1 className="mb-4">설문 조사 게시판</h1>

                {userId ? (
                    <>
                        <p className="mb-3">
                            <strong>{sessionStorage.getItem('userName') || '정보 없음'}</strong>님 로그인 중
                        </p>
                        <button onClick={handleLogout} className="btn btn-danger">
                            로그아웃
                        </button>
                        <Link to="/createsurvey" className="btn btn-success mx-2">
                            설문 등록
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="mb-3">로그인 후 이용해주세요.</p>
                        <Link to="/login" className="btn btn-primary mx-2">
                            로그인
                        </Link>
                        <Link to="/register" className="btn btn-warning mx-2">
                            회원가입
                        </Link>
                    </>
                )}
            </div>

            <Routes>
                <Route path="/" element={userId ? <Navigate to="/survey-list" /> : <Navigate to="/login" />} />
                <Route path="/login" element={<Login setUserId={setUserId} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/createsurvey" element={<CreateSurvey />} />
                <Route path="/survey-list" element={<SurveyList />} />
                <Route path="/surveys/:surveyId" element={<SurveyDetails />} />
                <Route path="/response/:id" element={<SurveyResponses />} />
            </Routes>
        </Router>
    );
}
