const express = require('express');
const router = express.Router();

// 模拟用户数据
const users = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    active: true
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'user',
    active: true
  },
  {
    id: 3,
    username: 'bob_wilson',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'user',
    active: true
  },
  {
    id: 4,
    username: 'alice_brown',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Brown',
    role: 'moderator',
    active: false
  },
  {
    id: 5,
    username: 'charlie_davis',
    email: 'charlie@example.com',
    firstName: 'Charlie',
    lastName: 'Davis',
    role: 'user',
    active: true
  }
];

/**
 * GET /api/users
 * 获取所有用户或根据查询参数过滤
 */
router.get('/', (req, res) => {
  let result = [...users];

  // 支持按角色过滤
  if (req.query.role) {
    result = result.filter(u => 
      u.role.toLowerCase() === req.query.role.toLowerCase()
    );
  }

  // 支持按活跃状态过滤
  if (req.query.active !== undefined) {
    const active = req.query.active === 'true';
    result = result.filter(u => u.active === active);
  }

  // 支持搜索
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    result = result.filter(u => 
      u.username.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm) ||
      u.firstName.toLowerCase().includes(searchTerm) ||
      u.lastName.toLowerCase().includes(searchTerm)
    );
  }

  res.json({
    total: result.length,
    users: result
  });
});

/**
 * GET /api/users/:id
 * 获取单个用户
 */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      error: 'Not Found',
      message: `User with id ${id} not found`
    });
  }

  res.json(user);
});

module.exports = router;
