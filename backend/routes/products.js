const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/products : Return all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET /api/products/:id : Return single product
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE product_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST /api/products : Add new product
router.post('/', async (req, res) => {
  const { name, description, price, image_url, stock } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, image_url, stock) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, image_url, stock]
    );
    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT /api/products/:id : Update product
router.put('/:id', async (req, res) => {
  const { name, description, price, image_url, stock } = req.body;
  try {
    await db.query(
      'UPDATE products SET name=?, description=?, price=?, image_url=?, stock=? WHERE product_id=?',
      [name, description, price, image_url, stock, req.params.id]
    );
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE /api/products/:id : Delete product
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE product_id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
