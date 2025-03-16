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

function App() {
    return (
        <DataProvider>
            <Router>
                <Breadcrumbs />
                <Routes>
                    <Route path="*" element={<PageNotFound />} />

                    <Route path="/" element={<Home />} />
                    <Route path="/FirstElection" element={<FirstElection />} />
                    <Route path="/FirstElection/GeneralConstraints" element={<h1>IN PROGRESS</h1>} />
                    <Route path="/FirstElection/:branch/SecondElection" element={<SecondElection />} />
                    <Route path="/FirstElection/:branch/SecondElection/Calendar" element={<Calendar />} />

                    <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/RoomsList" element={<RoomsList />} />
                    <Route path="/FirstElection/:branch/SecondElection/Calendar/:dayIndex/RoomsList/:roomId" element={<RoomDetails />} />
                    <Route path="/FirstElection/:branch/SecondElection/RoomsConstraints" element={<h1>IN PROGRESS</h1>} />

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
                </Routes>
            </Router>
        </DataProvider>
    );
}

export default App;
