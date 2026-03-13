const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/cart/:userId : Get user's cart
router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.cart_id, c.product_id, c.quantity, p.name, p.price, p.image_url 
      FROM cart c
      JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = ?
    `, [req.params.userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST /api/cart/add : Add product to cart
router.post('/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    // Check if item already in cart
    const [existing] = await db.query(
      'SELECT cart_id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQty = existing[0].quantity + (quantity || 1);
      await db.query('UPDATE cart SET quantity = ? WHERE cart_id = ?', [newQty, existing[0].cart_id]);
      return res.json({ message: 'Cart updated', cartId: existing[0].cart_id });
    } else {
      // Insert new
      const [result] = await db.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity || 1]
      );
      return res.status(201).json({ message: 'Added to cart', cartId: result.insertId });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT /api/cart/update : Update cart quantity
router.put('/update', async (req, res) => {
  const { cartId, quantity } = req.body;
  try {
    if (quantity <= 0) {
      await db.query('DELETE FROM cart WHERE cart_id = ?', [cartId]);
      return res.json({ message: 'Item removed from cart' });
    }
    await db.query('UPDATE cart SET quantity = ? WHERE cart_id = ?', [quantity, cartId]);
    res.json({ message: 'Cart quantity updated' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE /api/cart/remove : Remove item from cart
router.delete('/remove', async (req, res) => {
  const { cartId } = req.body; // or req.query depending on preference, we will use body or query handling in the route
  // Wait, standard DELETE usually takes parameters in URL or Query.
  // For safety, let's allow it in body or query since express handles body in DELETE via express.json() but many clients don't send body
  // Let's modify to take cartId from req.query or query string / remove/:cartId
  try {
     const idToRemove = req.body.cartId || req.query.cartId;
     if(!idToRemove) {
       return res.status(400).json({ message: 'cartId is required' });
     }
     await db.query('DELETE FROM cart WHERE cart_id = ?', [idToRemove]);
     res.json({ message: 'Item removed from cart' });
  } catch(error) {
     console.error('Error removing from cart:', error);
     res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST /api/cart/sync : Sync local storage cart to database upon login
router.post('/sync', async (req, res) => {
    const { userId, localCart } = req.body; // localCart is Array of {productId, quantity}
    try {
        if (!localCart || localCart.length === 0) return res.json({ message: 'No items to sync' });

        for (const item of localCart) {
            const [existing] = await db.query(
                'SELECT cart_id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
                [userId, item.productId]
            );
            if (existing.length > 0) {
                const newQty = existing[0].quantity + item.quantity;
                await db.query('UPDATE cart SET quantity = ? WHERE cart_id = ?', [newQty, existing[0].cart_id]);
            } else {
                await db.query(
                    'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                    [userId, item.productId, item.quantity]
                );
            }
        }
        res.json({ message: 'Cart synced successfully' });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Add DELETE by productId and userId for when the user clicks "remove" from the UI and we only have productId
router.delete('/user/:userId/product/:productId', async (req, res) => {
    try {
        await db.query('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [req.params.userId, req.params.productId]);
        res.json({ message: 'Item removed from cart' });
    } catch(error) {
        console.error('Error removing from cart', error);
        res.status(500).json({ message: 'Internal Error' });
    }
});

// DELETE /api/cart/clear/:userId : Clear entire cart for a user
router.delete('/clear/:userId', async (req, res) => {
    try {
        await db.query('DELETE FROM cart WHERE user_id = ?', [req.params.userId]);
        res.json({ message: 'Cart cleared successfully' });
    } catch(error) {
        console.error('Error clearing cart', error);
        res.status(500).json({ message: 'Internal Error' });
    }
});

module.exports = router;
