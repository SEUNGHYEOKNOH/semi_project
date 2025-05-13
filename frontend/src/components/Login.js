import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

export default function Login({ setUserId }) {
    // 🔥 setUserId를 props로 받음
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', pwd: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log('서버 응답 데이터:', data);

            if (response.ok && data.result === 'success' && data.data.length > 0) {
                const user = data.data[0];
                sessionStorage.setItem('userId', user.id);
                sessionStorage.setItem('userName', user.name);
                setUserId(user.id);

                alert('로그인 성공!');
                navigate('/survey-list');
            } else {
                setError(data.message || '로그인 실패');
            }
        } catch (err) {
            setError('서버 오류');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Card className="p-4 shadow" style={{ width: '350px' }}>
                <h2 className="text-center mb-3">로그인</h2>
                {error && (
                    <Alert variant="danger" className="text-center">
                        {error}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>이메일</Form.Label>
                        <Form.Control type="email" name="email" placeholder="이메일" required onChange={handleChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>비밀번호</Form.Label>
                        <Form.Control
                            type="password"
                            name="pwd"
                            placeholder="비밀번호"
                            required
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">
                        로그인
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}
