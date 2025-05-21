const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const SOL_DIR = '../data/test_solutions/';

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// Prepare —once— the list of allowed original filenames
let allowedFiles;
try {
    allowedFiles = fs.readdirSync(SOL_DIR)
        .filter(f => f.startsWith('sol_') && f.endsWith('.json'))
        .map(f => `${f.slice(4)}`); // from "sol_test02.json" to "test02.json"
} catch (err) {
    console.error(`Could not read solutions directory (${SOL_DIR}):`, err);
    process.exit(1);
}

app.post('/api/solve', (req, res) => {
    const fileName = req.query.file;
    if (!fileName) {
        return res.status(400).json({ error: 'Missing "file" parameter.' });
    }

    // Validate extension is .json
    if (path.extname(fileName) !== '.json') {
        return res.status(400).json({
            error: `Invalid extension: ${path.extname(fileName)}. Only .json is allowed.`
        });
    }

    // Validate against whitelist
    if (!allowedFiles.includes(fileName)) {
        return res.status(400).json({
            error: `File "${fileName}" is not valid. Available files: ${allowedFiles.join(', ')}.`
        });
    }

    // Extract base name, e.g. "test02" from "test02.json"
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
