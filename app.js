
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);


mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));


const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};


app.get('/', requireAuth, (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ email: username });

  if (!user || !(await user.comparePassword(password))) {
    return res.send('Invalid username or password');
  }

  req.session.user = user;
  res.redirect('/');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { firstName, lastName, mobile, country, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send('Passwords do not match');
  }

  try {
    const newUser = new User({ firstName, lastName, mobile, country, email, password });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    res.send('Error creating user: ' + error.message);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
