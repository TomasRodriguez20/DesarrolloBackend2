import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsFile = path.join(__dirname, '../data/productos.json');

export const getProducts = async () => {
  const data = await fs.readFile(productsFile, 'utf-8');
  return JSON.parse(data);
};


export const saveProducts = async (products) => {
  await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
};

router.get('/', async (req, res) => {
  try {
    const products = await getProducts();
    const { limit } = req.query;
    if (limit) {
      return res.json(products.slice(0, limit));
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const products = await getProducts();
    const product = products.find(p => p.id === req.params.pid);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
    }

    const products = await getProducts();
    const newId = products.length > 0 ? String(Number(products[products.length - 1].id) + 1) : '1';
    const newProduct = { id: newId, title, description, code, price, status, stock, category, thumbnails };
    products.push(newProduct);

    await saveProducts(products);
    req.app.get('io').emit('newProduct', newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const products = await getProducts();
    const newProducts = products.filter(p => p.id !== req.params.pid);

    if (newProducts.length === products.length) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await saveProducts(newProducts);
    req.app.get('io').emit('productDeleted', req.params.pid);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

router.get('/init', async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos iniciales' });
  }
});

export default router;
