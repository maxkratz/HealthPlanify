import "./App.css";

// import { Prueba } from "./views/Prueba";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from './DataContext';
import { Home } from "./views/Home/Home";
import { FirstElection } from "./views/FirstElection/FirstElection";
import { Calendar } from "./views/Calendar/Calendar";
import { Rooms } from "./views/Rooms/Rooms";

function App() {
    return (
        <DataProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/FirstElection" element={<FirstElection />} />
                    <Route path="/FirstElection/:branch/Calendar" element={<Calendar />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Rooms" element={<Rooms />} />
                </Routes>
            </Router>
        </DataProvider>
    );
}

export default App;
