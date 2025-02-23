import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from './DataContext';
import { Home } from "./views/Home/Home";
import { FirstElection } from "./views/FirstElection/FirstElection";

function App() {
    return (
        <DataProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/FirstElection" element={<FirstElection />} />
                </Routes>
            </Router>
        </DataProvider>
    );
}

export default App;
