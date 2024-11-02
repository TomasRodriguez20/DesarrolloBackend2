import express from 'express';
import { getProducts } from './products.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index'); 
});

router.get('/home', async (req, res) => {
  try {
    const products = await getProducts(); 
    res.render('home', { products }); 
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar la lista de productos' });
  }
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});
export default router;
