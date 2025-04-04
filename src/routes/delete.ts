import { Router } from 'express';
import { auth } from '../middlewares/authenticator';
import { message, user } from '../controllers/delete';

const router = Router();

router.delete('/user/:id', auth, user);
router.delete('/message', auth, message);

export default router;
