const express = require('express');
const router = express.Router();

// 模拟产品数据
let products = [
  {
    id: 1,
    name: 'Laptop',
    description: 'High-performance laptop',
    price: 1299.99,
    category: 'Electronics',
    inStock: true
  },
  {
    id: 2,
    name: 'Smartphone',
    description: 'Latest smartphone model',
    price: 899.99,
    category: 'Electronics',
    inStock: true
  },
  {
    id: 3,
    name: 'Headphones',
    description: 'Wireless noise-cancelling headphones',
    price: 299.99,
    category: 'Audio',
    inStock: true
  },
  {
    id: 4,
    name: 'Keyboard',
    description: 'Mechanical gaming keyboard',
    price: 149.99,
    category: 'Accessories',
    inStock: false
  },
  {
    id: 5,
    name: 'Mouse',
    description: 'Ergonomic wireless mouse',
    price: 79.99,
    category: 'Accessories',
    inStock: true
  }
];

let nextId = 6;

/**
 * GET /api/products
 * 获取所有产品或根据查询参数过滤
 */
router.get('/', (req, res) => {
  let result = [...products];

  // 支持按类别过滤
  if (req.query.category) {
    result = result.filter(p => 
      p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  // 支持按库存状态过滤
  if (req.query.inStock !== undefined) {
    const inStock = req.query.inStock === 'true';
    result = result.filter(p => p.inStock === inStock);
  }

  // 支持搜索
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm)
    );
  }

  res.json({
    total: result.length,
    products: result
  });
});

/**
 * GET /api/products/:id
 * 获取单个产品
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Product with id ${id} not found`
    });
  }

  res.json(product);
});

/**
 * POST /api/products
 * 创建新产品
 */
router.post('/', (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  // 验证必填字段
  if (!name || !price) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Name and price are required'
    });
  }

  const newProduct = {
    id: nextId++,
    name,
    description: description || '',
    price: parseFloat(price),
    category: category || 'Uncategorized',
    inStock: inStock !== undefined ? inStock : true
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

/**
 * PUT /api/products/:id
 * 更新产品
 */
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Product with id ${id} not found`
    });
  }

  const { name, description, price, category, inStock } = req.body;

  // 更新产品（只更新提供的字段）
  if (name !== undefined) products[index].name = name;
  if (description !== undefined) products[index].description = description;
  if (price !== undefined) products[index].price = parseFloat(price);
  if (category !== undefined) products[index].category = category;
  if (inStock !== undefined) products[index].inStock = inStock;

  res.json(products[index]);
});

/**
 * DELETE /api/products/:id
 * 删除产品
 */
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Product with id ${id} not found`
    });
  }

  const deletedProduct = products.splice(index, 1)[0];

  res.json({
    message: 'Product deleted successfully',
    product: deletedProduct
  });
});

module.exports = router;
