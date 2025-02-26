import "./App.css";

// import { Prueba } from "./views/Prueba";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from './DataContext';
import { Home } from "./views/Home/Home";
import { FirstElection } from "./views/FirstElection/FirstElection";
import { Patients } from "./views/Patients/Patients";
import { PatientsDayDetail } from "./views/PatientsDayDetail";

function App() {
    return (
        <DataProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/FirstElection" element={<FirstElection />} />
                    <Route path="/FirstElection/Patients" element={<Patients />} />
                    <Route path="/FirstElection/Patients/:dayId" element={<PatientsDayDetail />} />
                </Routes>
            </Router>
        </DataProvider>
    );
}

export default App;
