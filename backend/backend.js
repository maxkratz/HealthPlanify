const express = require('express');
const path = require('path');

const {
    HeuristicaConstructivaAleatoria,
    HeuristicaDummy,
    Heuristica
} = require('./heuristic');

const heuristicsMap = {
    random: new HeuristicaConstructivaAleatoria(),
    dummy: new HeuristicaDummy(),
};

const app = express();
app.use(express.json({ limit: '5mb' }));

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

    const inputData = req.body;
    const selected = heuristicsMap[heuristic] || heuristicsMap.random;
    const context = new Heuristica(selected);

    try {
        const solution = context.ejecutarHeuristica(inputData);
        return res.json(solution);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Server error: ' + e.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Mock API running at http://localhost:${PORT}`);
});
