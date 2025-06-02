const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const { constructiveHeuristic } = require('./heuristic');

const SOL_DIR = '../data/test-solutions/';

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

let allowedFiles;
try {
    allowedFiles = fs.readdirSync(SOL_DIR)
        .filter(f => f.startsWith('sol_') && f.endsWith('.json'))
        .map(f => `${f.slice(4)}`);
} catch (err) {
    console.error(`Could not read solutions directory (${SOL_DIR}):`, err);
    process.exit(1);
}

app.post('/api/solve', (req, res) => {
    const fileName = req.query.file;
    if (!fileName) {
        return res.status(400).json({ error: 'Missing "file" parameter.' });
    }

    // Validar extensión .json
    if (path.extname(fileName) !== '.json') {
        return res.status(400).json({
            error: `Invalid extension: ${path.extname(fileName)}. Only .json is allowed.`
        });
    }

    // Si el fileName *no* está en la whitelist, asumimos que el cuerpo
    // de la petición es un JSON válido con la instancia y generamos solución:
    if (!allowedFiles.includes(fileName)) {
        try {
            const inputData = req.body; // aquí debe ir el JSON de la instancia
            // Llamamos a la heurística constructiva:
            const solution = constructiveHeuristic(inputData);
            return res.json(solution);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid inputData: ' + e.message });
        }
    }

    // Si sí está en la whitelist, devolvemos el fichero precomputado:
    const base = path.basename(fileName, '.json');
    const solFile = `sol_${base}.json`;
    const solPath = path.join(SOL_DIR, solFile);

    fs.readFile(solPath, 'utf8', (err, raw) => {
        if (err) {
            return res.status(404).json({ error: `Solution file ${solFile} not found.` });
        }
        try {
            const data = JSON.parse(raw);
            return res.json(data);
        } catch {
            return res.status(500).json({ error: 'Invalid JSON in solution file.' });
        }
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Mock API running at http://localhost:${PORT}`);
});