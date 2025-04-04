import { Router } from 'express';
import validator from '../middlewares/validator';
import { auth } from '../middlewares/authenticator';
import { contact, login, message, register } from '../controllers/post';
import { contactSchema, loginSchema, messageSchema, registerSchema } from '../schemas/post';

const router = Router();

router.post('/register', validator(registerSchema), register);
router.post('/login', validator(loginSchema), login);
router.post('/message', auth, validator(messageSchema), message);
router.post('/contact', validator(contactSchema), contact);

export default router;
