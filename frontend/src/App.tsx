import "./App.css";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { DataProvider } from './DataContext';
import { InputFiles } from "./components/InputFiles";
import { Prueba } from "./components/Prueba";

function App() {
  return (
    <DataProvider>
      <Router>
        <nav>
          <Link to="/">Inicio</Link>
          <br />
          <Link to="/otra">Ir a Otra Página</Link>
          <br />
          <br />
        </nav>

        <Routes>
          <Route path="/" element={<InputFiles />} />
          <Route path="/otra" element={<Prueba />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
