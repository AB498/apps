const express = require('express');
const app = express();
const path = require('path');

app.use('/', express.static(path.join(__dirname, './')));

app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/specific', (req, res) => {
    res.send('Specific');
});

module.exports = app;