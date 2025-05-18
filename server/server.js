const express = require('express');
const app = express();
const open = require('open');
const path = require('path');
const pool = require('./database');
const PORT = 5000;

app.use(express.static(path.join(__dirname, '..', 'views')));
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
    res.render('login')
})

app.post('/login', (req, res) => {
    const email = req.body["email"];
    const password = req.body["password"];

    // res.send(`Your email is ${email} and your password is ${password} `);

    const checkInfo = `SELECT * FROM users WHERE email = $1 AND password = $2`;

    pool.query(checkInfo, [email, password])
    .then(result => {
      if (result.rows.length > 0) {
        const first_name = result.rows[0].first_name;
        const last_name =  result.rows[0].last_name;
        res.render('dashboard', { first_name: first_name, last_name: last_name});
      }
      else {
        res.send('User not found. Create an account');
      }
    })
    .catch (err => {
      console.log(err)
    });
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})