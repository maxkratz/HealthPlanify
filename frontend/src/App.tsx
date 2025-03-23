import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from './DataContext';
import { PageNotFound } from "./views/PageNotFound";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { Home } from "./views/Home/Home";
import { FirstElection } from "./views/FirstElection/FirstElection";
import { SecondElection } from "./views/SecondElection";
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
import { SolutionGrid } from "./views/GraphicSolutionModifier/SolutionGrid/SolutionGrid";

function App() {
    return (
        <DataProvider>
            <DndProvider backend={HTML5Backend}>
                <Router>
                    <Breadcrumbs />
                    <Routes>
                        <Route path="*" element={<PageNotFound />} />

                        <Route path="/" element={<Home />} />
                        <Route path="/FirstElection" element={<FirstElection />} />
                        <Route path="/FirstElection/:branch/SecondElection" element={<SecondElection />} />
                        <Route path="/FirstElection/:branch/SecondElection/Calendar" element={<Calendar />} />

                        <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/RoomsList" element={<RoomsList />} />
                        <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/RoomsList/:roomId" element={<RoomDetails />} />

                        <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/Shifts" element={<Shifts />} />
                        <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/Shifts/:shiftType/NursesList" element={<NursesList />} />
                        <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/Shifts/:shiftType/NursesList/:nurseId" element={<NurseDetails />} />
                        <Route path="/FirstElection/:branch/SecondElection/NursesConstraints" element={<NursesConstraints />} />

                        <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/SurgeonsList" element={<SurgeonsList />} />
                        <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/SurgeonsList/:surgeonId" element={<SurgeonDetails />} />
                        <Route path="/FirstElection/:branch/SecondElection/SurgeonsConstraints" element={<SurgeonsConstraints />} />

                        <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/OperatingTheatersList" element={<OperatingTheatersList />} />
                        <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/OperatingTheatersList/:operatingTheaterId" element={<OperatingTheaterDetails />} />
                        <Route path="/FirstElection/:branch/SecondElection/OperatingTheatersConstraints" element={<OperatingTheaterConstraints />} />

                        <Route path="/FirstElection/Patients" element={<PatientsList />} />

                        <Route path="/FirstElection/Test" element={<SolutionGrid />} />
                    </Routes>
                </Router>
            </DndProvider>
        </DataProvider>
    );
}

export default App;
