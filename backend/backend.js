const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const {
    HeuristicaConstructivaAleatoria,
    HeuristicaDummy,
    Heuristica
} = require('./heuristic');

const randomConstructiveHeuristic = new HeuristicaConstructivaAleatoria();
const dummyHeuristic = new HeuristicaDummy();

const app = express();
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.post('/api/solve', (req, res) => {
    const { file, heuristic } = req.query;

    if (!file) {
        return res.status(400).json({ error: 'Missing "file" parameter.' });
    }
    if (path.extname(file) !== '.json') {
        return res.status(400).json({
            error: `Invalid extension: ${path.extname(file)}. Only .json is allowed.`
        });
    }

    const heuristicsMap = {
        random: randomConstructiveHeuristic,
        dummy: dummyHeuristic,
    };

    const selected = heuristicsMap[heuristic] || randomConstructiveHeuristic;

    const context = new Heuristica(selected);

    try {
        const inputData = req.body;
        const solution = context.ejecutarHeuristica(inputData);
        return res.json(solution);
    } catch (e) {
        return res.status(400).json({ error: 'Invalid inputData: ' + e.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Mock API running at http://localhost:${PORT}`);
});