import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getProfile, updateProfile, getOrderHistory } from '../controllers.user.controller';

const router = Router();

router.get('/profile', verifyToken, getProfile);
router.put('/update-profile', verifyToken, updateProfile);
router.get('/order-history', verifyToken, getOrderHistory);

export default router;