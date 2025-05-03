const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const data = require(path.join('/home/nestor/TFG/validator/test_solutions/sol_test01.json'));

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.post('/api/solve', (req, res) => {
    console.log('Recibido en mock:', req.body);

    setTimeout(() => {
        res.json(data);
    }, 500);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Mock API corriendo en http://localhost:${PORT}`);
});
