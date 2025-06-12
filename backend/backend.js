const cluster = require('cluster');
const os = require('os');
const express = require('express');

const {
    HeuristicaConstructivaAleatoria,
    HeuristicaDummy,
    Heuristica
} = require('./heuristic');

const heuristicsMap = {
    random: new HeuristicaConstructivaAleatoria(),
    dummy: new HeuristicaDummy(),
};

const PORT = process.env.PORT || 3001;

if (cluster.isMaster) {
    const cpus = os.cpus().length;
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Forking a new one.`);
        cluster.fork();
    });
} else {
    const app = express();
    app.use(express.json({ limit: '5mb' }));

    app.post('/api/solve', (req, res) => {
        const { heuristic } = req.query;

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

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} listening on port ${PORT}`);
    });
}
