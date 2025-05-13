import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', pwd: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('http://localhost:5001/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                alert('회원가입 성공! 로그인하세요.');
                window.location.href = '/login';
            } else {
                setError(data.message || '회원가입 실패');
            }
        } catch (err) {
            setError('서버 오류');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Card className="p-4 shadow" style={{ width: '350px' }}>
                <h2 className="text-center mb-3">회원가입</h2>
                {error && (
                    <Alert variant="danger" className="text-center">
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" className="text-center">
                        회원가입 성공!
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>사용자명</Form.Label>
                        <Form.Control type="text" name="name" placeholder="사용자명" required onChange={handleChange} />
                    </Form.Group>
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
                    <Button variant="success" type="submit" className="w-100">
                        회원가입
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}
