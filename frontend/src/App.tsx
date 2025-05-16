import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from './DataContext';
import { PageNotFound } from "./views/PageNotFound";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { Menu } from "./components/Menu/Menu";
import { Home } from "./views/Home/Home";
import { Election } from "./views/Election";
import { Calendar } from "./views/Calendar/Calendar";
import { RoomsList } from "./views/Room/RoomsList/RoomsList";
import { RoomDetails } from "./views/Room/RoomDetails/RoomDetails";
import { Shifts } from "./views/Nurse/Shifts/Shifts";
import { NursesList } from "./views/Nurse/NursesList";
import { NurseDetails } from "./views/Nurse/NurseDetails";
import { NursesConstraints } from "./views/Nurse/NursesConstraints";
import { SurgeonsList } from "./views/Surgeon/SurgeonsList/SurgeonsList";
import { SurgeonDetails } from "./views/Surgeon/SurgeonDetails";
import { SurgeonsConstraints } from "./views/Surgeon/SurgeonsConstraints";
import { OperatingTheatersList } from "./views/OperatingTheater/OperatingTheatersList/OperatingTheatersList";
import { OperatingTheaterDetails } from "./views/OperatingTheater/OperatingTheaterDetails";
import { OperatingTheaterConstraints } from "./views/OperatingTheater/OperatingTheaterConstraints";
import { PatientsList } from "./views/Patient/PatientsList";

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PatientScheduler } from "./views/PatientScheduler/PatientScheduler/PatientScheduler";
import { NurseScheduler } from "./views/NurseScheduler/NurseScheduler/NurseScheduler";

function App() {
    return (
        <DataProvider>
            <DndProvider backend={HTML5Backend}>
                <Router>
                    <Breadcrumbs />
                    <Menu />
                    <Routes>
                        <Route path="*" element={<PageNotFound />} />

                        <Route path="/" element={<Home />} />
                        <Route path="/:branch/Election" element={<Election />} />
                        <Route path="/:branch/Election/Calendar" element={<Calendar />} />

                        <Route path="/:branch/Election/Calendar/:dayIndex/RoomsList" element={<RoomsList />} />
                        <Route path="/:branch/Election/Calendar/:dayIndex/RoomsList/:roomId" element={<RoomDetails />} />

                        <Route path="/:branch/Election/Calendar/:dayIndex/Shifts" element={<Shifts />} />
                        <Route path="/:branch/Election/Calendar/:dayIndex/Shifts/:shiftType/NursesList" element={<NursesList />} />
                        <Route path="/:branch/Election/Calendar/:dayIndex/Shifts/:shiftType/NursesList/:nurseId" element={<NurseDetails />} />
                        <Route path="/:branch/Election/NursesConstraints" element={<NursesConstraints />} />

                        <Route path="/:branch/Election/Calendar/:dayIndex/SurgeonsList" element={<SurgeonsList />} />
                        <Route path="/:branch/Election/Calendar/:dayIndex/SurgeonsList/:surgeonId" element={<SurgeonDetails />} />
                        <Route path="/:branch/Election/SurgeonsConstraints" element={<SurgeonsConstraints />} />

                        <Route path="/:branch/Election/Calendar/:dayIndex/OperatingTheatersList" element={<OperatingTheatersList />} />
                        <Route path="/:branch/Election/Calendar/:dayIndex/OperatingTheatersList/:operatingTheaterId" element={<OperatingTheaterDetails />} />
                        <Route path="/:branch/Election/OperatingTheatersConstraints" element={<OperatingTheaterConstraints />} />

                        <Route path="/Patients" element={<PatientsList />} />

                        <Route path="/PatientScheduler" element={<PatientScheduler />} />
                        <Route path="/NurseScheduler" element={<NurseScheduler />} />
                    </Routes>
                </Router>
            </DndProvider>
        </DataProvider>
    );
}

export default App;
