const express = require('express');
const app = express();
const open = require('open');
const path = require('path');
const PORT = 5000;

app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'login.html'));
})

app.post('/login', (req, res) => {
    res.send("Logged in successfully")
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})