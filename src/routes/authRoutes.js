const router=require('express').Router();
const controller=require('../controller/AuthController');
const wrap=require('../middleware/asyncHandler');
const validate=require('../middleware/validate');
const {validateRegister,validateLogin}=require('../middleware/validator/user');
router.post('/register',validate(validateRegister),wrap(controller.Register));
router.post('/login',validate(validateLogin),wrap(controller.Login));
module.exports=router;
