const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();
const open = require('open');
const path = require('path');
const pool = require('./database');
const PORT = 5000;


app.use(express.static(path.join(__dirname, '..', 'views')));
app.use(express.urlencoded({ extended: true }));
// setting up session
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy ({
  usernameField: 'email',
  passwordField: 'password'
  },
  (email, password, done) => {
    const query = `SELECT * FROM users WHERE email = $1 AND password = $2`;
    pool.query(query, [email, password], (err, result) => {
      if (err) return done(err);
      if (result.rows.length === 0) {
        return done(null, false, { message: 'invalid creds' });
      }
      return done(null, result.rows[0]);
    });
  }



));

// save user in session

passport.serializeUser((user, done) => {
  done(null, user.email);
});

// retrieve user from session

passport.deserializeUser((user, done) => {
  pool.query(`SELECT * FROM users WHERE email = $1`, [user], (err, result) => {
    if (err) return done(err);
    done(null, result.rows[0]);
  });
});

// protection middleware

function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}



app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
    res.render('login');
})

app.get('/signup', (req, res) => {
  res.render('signup');
})

app.post('/signup', (req, res) => {
  const first_name = req.body["first_name"];
  const last_name = req.body["last_name"];
  const email = req.body["email"];
  const password = req.body["password"];

  const addInfo = `INSERT INTO users (email, first_name, last_name, password) VALUES($1, $2, $3, $4)`;

  pool.query(addInfo, [email, first_name, last_name, password])
  .then(response => {
    console.log("User added");
    res.render('login');
  })
  .catch(err => {
    console.log(err);
  });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
}));

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  const {first_name, last_name, email, user_id} = req.user;
  checkTasks = `SELECT * FROM assignments WHERE user_id = $1`;
  pool.query(checkTasks, [user_id])
  .then(result => {
    const assignment_name = result.rows[0].assignment_name;
    const due_date = result.rows[0].due_date;
    const description = result.rows[0].description;

    res.render('dashboard', {first_name, last_name, email, tasks : result.rows } );

    console.log(assignment_name);
  })
  .catch(err => {
    console.log(err);
  });

  

});



app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});