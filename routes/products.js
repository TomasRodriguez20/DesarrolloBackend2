const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');

const productsFile = path.join(__dirname, '../data/productos.json');

const getProducts = async () => {
  const data = await fs.readFile(productsFile, 'utf-8');
  return JSON.parse(data);
};

const saveProducts = async (products) => {
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
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto' });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === req.params.pid);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { id, ...updates } = req.body;
    products[productIndex] = { ...products[productIndex], ...updates };

    await saveProducts(products);
    res.json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
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
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = router;
