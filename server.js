const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.json());

const productRouter = require('./routes/products');
const cartRouter = require('./routes/carts');

app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
