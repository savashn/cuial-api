import { Router } from 'express';
import { auth } from '../middlewares/authenticator';
import { checkToken, forgotPassword, messages, user, verify } from '../controllers/get';

const router = Router();

router.get('/users/:id', auth, user);
router.get('/messages', auth, messages);
router.get('/forgot-password', forgotPassword);
router.get('/check-token/:token', checkToken);
router.get('/verify', verify);

export default router;
