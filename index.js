const { Sequelize, DataTypes, Op } = require('sequelize');

//подключение к бд
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

//модели
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true });

const Post = sequelize.define('Post', {
  title: { type: DataTypes.STRING, allowNull: false },
  publishedAt: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
}, { timestamps: true });

const Author = sequelize.define('Author', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING },
});

const Book = sequelize.define('Book', {
  title: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER },
  genre: { type: DataTypes.STRING },
});

const Student = sequelize.define('Student', {
  name: { type: DataTypes.STRING, allowNull: false },
  group: { type: DataTypes.STRING },
});

const Course = sequelize.define('Course', {
  title: { type: DataTypes.STRING, allowNull: false },
  credits: { type: DataTypes.INTEGER, allowNull: false },
});

const Enrollment = sequelize.define('Enrollment', {
  enrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  grade: { type: DataTypes.INTEGER },
});

const Order = sequelize.define('Order', {
  number: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('new', 'paid', 'shipped'), defaultValue: 'new' },
}, { timestamps: true });

const Item = sequelize.define('Item', {
  productName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});

//связи
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Author.hasMany(Book, { foreignKey: 'authorId', as: 'books' });
Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });

Student.belongsToMany(Course, { through: Enrollment, as: 'courses' });
Course.belongsToMany(Student, { through: Enrollment, as: 'students' });

Order.hasMany(Item, { foreignKey: 'orderId', as: 'items' });
Item.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

//тестовые даннык
async function seedData() {
  const u1 = await User.create({ name: 'Alice', email: 'a@a.com', isActive: true });
  const u2 = await User.create({ name: 'Bob', email: 'b@b.com', isActive: false });
  const u3 = await User.create({ name: 'Charlie', email: 'c@c.com', isActive: true });

  await Post.create({ title: 'Old', publishedAt: '2022-05-01', status: 'published', authorId: u1.id, createdAt: '2022-05-01' });
  await Post.create({ title: 'New', publishedAt: '2023-06-15', status: 'published', authorId: u1.id, createdAt: '2023-06-15' });
  await Post.create({ title: 'Draft', publishedAt: '2023-08-01', status: 'draft', authorId: u1.id, createdAt: '2023-08-01' });
  await Post.create({ title: 'Bob Post', publishedAt: '2023-09-01', status: 'published', authorId: u2.id, createdAt: '2023-09-01' });

  const a1 = await Author.create({ firstName: 'Leo', lastName: 'Tolstoy', country: 'RU' });
  const a2 = await Author.create({ firstName: 'No', lastName: 'Books', country: 'XX' });
  await Book.create({ title: 'War and Peace', year: 1869, authorId: a1.id });

  const s1 = await Student.create({ name: 'Ivan', group: 'A1' });
  const s2 = await Student.create({ name: 'Maria', group: 'B2' });
  const c1 = await Course.create({ title: 'Easy', credits: 2 });
  const c2 = await Course.create({ title: 'Hard', credits: 5 });
  await Enrollment.create({ StudentId: s1.id, CourseId: c1.id });
  await Enrollment.create({ StudentId: s2.id, CourseId: c2.id });

  const o1 = await Order.create({ number: 'ORD-1', createdAt: '2023-10-01' });
  const o2 = await Order.create({ number: 'ORD-2', createdAt: '2023-10-05' });
  await Item.create({ productName: 'Big', quantity: 5, price: 50.00, orderId: o1.id });
  await Item.create({ productName: 'Small', quantity: 1, price: 5.00, orderId: o2.id });

  console.log('Данные добавлены');
}

//задание 1
async function task1() {
  console.log('ЗАДАНИЕ 1');
  return User.findAll({
    include: [{
      model: Post, as: 'posts',
      where: { publishedAt: { [Op.gt]: '2023-01-01' } },
      required: true,
    }],
    order: [
      ['name', 'ASC'],
      [{ model: Post, as: 'posts' }, 'publishedAt', 'DESC']
    ],
  });
}

//задание 2
async function task2() {
  console.log('ЗАДАНИЕ 2');
  return Author.findAll({
    include: [{ model: Book, as: 'books', required: false }],
    order: [['lastName', 'ASC']],
  });
}

//задание 3
async function task3() {
  console.log('ЗАДАНИЕ 3');
  return Student.findAll({
    include: [{
      model: Course, as: 'courses',
      where: { credits: { [Op.gt]: 3 } },
      required: true,
      through: { attributes: [] }
    }],
    order: [
      ['name', 'ASC'],
      [{ model: Course, as: 'courses' }, 'title', 'ASC']
    ],
  });
}

//задание 4
async function task4() {
  console.log('ЗАДАНИЕ 4');
  return Order.findAll({
    include: [{
      model: Item, as: 'items',
      where: { quantity: { [Op.gt]: 2 } },
      required: true,
    }],
    order: [
      ['createdAt', 'DESC'],
      [{ model: Item, as: 'items' }, 'price', 'DESC']
    ],
  });
}

//адание 5
async function task5() {
  console.log('зАДАНИЕ 5');
  return User.findAll({
    where: { isActive: true },
    include: [{
      model: Post, as: 'posts',
      where: { status: 'published' },
      required: true,
    }],
    order: [
      ['name', 'ASC'],
      [{ model: Post, as: 'posts' }, 'createdAt', 'DESC']
    ],
  });
}

//запуск
async function main() {
  try {
    await sequelize.sync({ force: true });
    console.log('Модели созданы');
    await seedData();

    const r1 = await task1();
    console.log(`Пользователей: ${r1.length}`);
    r1.forEach(u => console.log(`- ${u.name}: ${u.posts.map(p => p.title).join(', ')}`));

    const r2 = await task2();
    console.log(`\nАвторов: ${r2.length}`);
    r2.forEach(a => console.log(`- ${a.lastName} (книг: ${a.books.length})`));

    const r3 = await task3();
    console.log(`\nСтудентов на сложных курсах: ${r3.length}`);
    r3.forEach(s => console.log(`- ${s.name}: ${s.courses.map(c => c.title).join(', ')}`));

    const r4 = await task4();
    console.log(`\nЗаказов с крупными товарами: ${r4.length}`);
    r4.forEach(o => console.log(`- ${o.number}: ${o.items.map(i => i.productName).join(', ')}`));

    const r5 = await task5();
    console.log(`\nАктивных с опубликованными: ${r5.length}`);
    r5.forEach(u => console.log(`- ${u.name}: ${u.posts.map(p => p.title).join(', ')}`));

  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await sequelize.close();
  }
}

main();