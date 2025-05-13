const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//회원등록 요청
router.post('/', userController.createUser);

//모든 회원 조회
router.get('/', userController.getAllUsers);

//특정 회원 조회
router.get('/:id', userController.getUser);

//회원 정보 수정 요청
router.put('/:id', userController.updateUser);

//회원 삭제 요청
router.delete('/:id', userController.deleteUser);

//회원 등록 또는 수정 시 아이디(email) 중복체크
router.post('/duplex', userController.duplicatedEmail);

module.exports = router;
