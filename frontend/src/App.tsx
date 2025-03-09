import "./App.css";

// import { Prueba } from "./views/Prueba";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from './DataContext';
import { Breadcrumbs } from "./components/Breadcrumbs";
import { Home } from "./views/Home/Home";
import { FirstElection } from "./views/FirstElection/FirstElection";
import { Calendar } from "./views/Calendar/Calendar";
import { RoomsList } from "./views/RoomsList/RoomsList";
import { RoomDetails } from "./views/RoomDetails/RoomDetails";
import { Shifts } from "./views/Shifts/Shifts";
import { NursesInfo } from "./views/NursesInfo/NursesInfo";
import { NurseDetails } from "./views/NurseDetails";
import { Surgeons } from "./views/Surgeons/Surgeons";
import { SurgeonDetails } from "./views/SurgeonDetails";

function App() {
    return (
        <DataProvider>
            <Router>
                <Breadcrumbs />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/FirstElection" element={<FirstElection />} />
                    <Route path="/FirstElection/:branch/Calendar" element={<Calendar />} />

                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/RoomsList" element={<RoomsList />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/RoomsList/:roomId" element={<RoomDetails />} />

                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Shifts" element={<Shifts />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Shifts/:shiftType/NursesInfo" element={<NursesInfo />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Shifts/:shiftType/NursesInfo/:nurseId" element={<NurseDetails />} />

                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Surgeons" element={<Surgeons />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Surgeons/:surgeonId" element={<SurgeonDetails />} />
                </Routes>
            </Router>
        </DataProvider>
    );
}

export default App;
