//3rd Party Modules
const { Router } = require('express');
const { check } = require('express-validator');

const router = Router();
const {
        signUp, 
        logIn, 
        } = require('../controllers/usersControllers');

router.post('/signup',
        [
        check('email').normalizeEmail().isEmail(),
        check('name').isLength({min:3}),
        check('password').isLength({min:6})
        ], signUp);

router.post('/login', [ 
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min:6})
        ], logIn);

module.exports = router;