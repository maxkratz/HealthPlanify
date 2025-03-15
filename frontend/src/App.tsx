import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from './DataContext';
import { PageNotFound } from "./views/PageNotFound";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { Home } from "./views/Home/Home";
import { FirstElection } from "./views/FirstElection/FirstElection";
import { Calendar } from "./views/Calendar/Calendar";
import { RoomsList } from "./views/Room/RoomsList/RoomsList";
import { RoomDetails } from "./views/Room/RoomDetails/RoomDetails";
import { Shifts } from "./views/Nurse/Shifts/Shifts";
import { NursesList } from "./views/Nurse/NursesList/NursesList";
import { NurseDetails } from "./views/Nurse/NurseDetails";
import { SurgeonsList } from "./views/Surgeon/SurgeonsList/SurgeonsList";
import { SurgeonDetails } from "./views/Surgeon/SurgeonDetails";
import { OperatingTheatersList } from "./views/OperatingTheater/OperatingTheatersList/OperatingTheatersList";
import { OperatingTheaterDetails } from "./views/OperatingTheater/OperatingTheaterDetails";

function App() {
    return (
        <DataProvider>
            <Router>
                <Breadcrumbs />
                <Routes>
                    <Route path="*" element={<PageNotFound />} />

                    <Route path="/Home" element={<Home />} />
                    <Route path="/FirstElection" element={<FirstElection />} />
                    <Route path="/FirstElection/:branch/Calendar" element={<Calendar />} />

                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/RoomsList" element={<RoomsList />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/RoomsList/:roomId" element={<RoomDetails />} />

                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Shifts" element={<Shifts />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Shifts/:shiftType/NursesList" element={<NursesList />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/Shifts/:shiftType/NursesList/:nurseId" element={<NurseDetails />} />

                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/SurgeonsList" element={<SurgeonsList />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/SurgeonsList/:surgeonId" element={<SurgeonDetails />} />

                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/OperatingTheatersList" element={<OperatingTheatersList />} />
                    <Route path="/FirstElection/:branch/Calendar/:dayIndex/OperatingTheatersList/:operatingTheaterId" element={<OperatingTheaterDetails />} />
                </Routes>
            </Router>
        </DataProvider>
    );
}

export default App;
