const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');

const cartsFile = path.join(__dirname, '../data/carritos.json');
const productsFile = path.join(__dirname, '../data/productos.json');

const getCarts = async () => {
  const data = await fs.readFile(cartsFile, 'utf-8');
  return JSON.parse(data);
};

const saveCarts = async (carts) => {
  await fs.writeFile(cartsFile, JSON.stringify(carts, null, 2));
};

const getProducts = async () => {
  const data = await fs.readFile(productsFile, 'utf-8');
  return JSON.parse(data);
};

router.post('/', async (req, res) => {
  try {
    const carts = await getCarts();
    const newId = carts.length > 0 ? String(Number(carts[carts.length - 1].id) + 1) : '1';
    const newCart = { id: newId, products: [] };
    carts.push(newCart);

    await saveCarts(carts);
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const carts = await getCarts();
    const cart = carts.find(c => c.id === req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const carts = await getCarts();
    const cartIndex = carts.findIndex(c => c.id === req.params.cid);
    if (cartIndex === -1) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const products = await getProducts();
    const product = products.find(p => p.id === req.params.pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const cart = carts[cartIndex];
    const productInCart = cart.products.find(p => p.product === req.params.pid);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await saveCarts(carts);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto al carrito' });
  }
});

module.exports = router;
