const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const SOL_DIR = '/home/nestor/TFG/validator/test_solutions';

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.post('/api/solve', (req, res) => {
    const fileName = req.query.file;
    if (!fileName) {
        console.log('Falta parámetro “file”');
        return res.status(400).json({ error: 'Falta parámetro “file”' });
    }

    // extrae “test02” de “test02.json”
    const base = path.basename(fileName, path.extname(fileName));
    const solFile = `sol_${base}.json`;
    const solPath = path.join(SOL_DIR, solFile);

    fs.readFile(solPath, 'utf8', (err, raw) => {
        if (err) {
            return res.status(404).json({ error: `No existe ${solFile}` });
        }
        try {
            const data = JSON.parse(raw);
            return res.json(data);
        } catch {
            return res.status(500).json({ error: 'JSON inválido en solución' });
        }
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Mock API corriendo en http://localhost:${PORT}`);
});
