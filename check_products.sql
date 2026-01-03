SELECT id, name, category, status, price_cents 
FROM products 
WHERE status = 'active'
ORDER BY price_cents;
