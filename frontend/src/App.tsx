import "./App.css";

// import { Prueba } from "./views/Prueba";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from './DataContext';
import { Breadcrumbs } from "./components/Breadcrumbs";
import { Home } from "./views/Home/Home";
import { FirstElection } from "./views/FirstElection/FirstElection";
import { Calendar } from "./views/Calendar/Calendar";
import { Rooms } from "./views/Rooms/Rooms";
import { RoomDetails } from "./views/RoomDetails/RoomDetails";
import { Shifts } from "./views/Shifts/Shifts";
import { Nurses } from "./views/Nurses/Nurses";
import { NurseDetails } from "./views/NurseDetails";

function App() {
    return (
        <DataProvider>
            <Router>
                <Breadcrumbs />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/FirstElection" element={<FirstElection />} />
                    <Route path="/FirstElection/:branch/Calendar" element={<Calendar />} />

                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Rooms" element={<Rooms />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Rooms/:roomId" element={<RoomDetails />} />

                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Shifts" element={<Shifts />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Shifts/:shiftType/Nurses" element={<Nurses />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Shifts/:shiftType/Nurses/:nurseId" element={<NurseDetails />} />

                </Routes>
            </Router>
        </DataProvider>
    );
}

export default App;
