import { Router } from 'express';
import validator from '../middlewares/validator';
import { auth } from '../middlewares/authenticator';
import { password, putMessageSchema, putUserSchema } from '../schemas/put';
import { changePassword, putUser, forgotPassword } from '../controllers/put';
import { putMessage } from '../controllers/put';

const router = Router();

router.put('/password', auth, validator(password), changePassword);
router.put('/forgot-password', forgotPassword);
router.put('/message', auth, validator(putMessageSchema), putMessage);
router.put('/user/:user', auth, validator(putUserSchema), putUser);

export default router;
