import express from 'express';
import { get_items } from './product-controller.js'

const router = express.Router();

router.get('/items', get_items);


export default router;