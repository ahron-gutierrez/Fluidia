import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";

import Overview from "./features/Overview";

import FluidsPage from "./features/01_fluids/page";  

import DensityPage from "./features/02_density/page";

import SpecificGravityPage from "./features/03_specific-gravity/page";

import ArchimedesPage from "./features/04_archimedes/page";

import RateOfFlowPage from "./features/05_rate-of-flow/page";

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/fluids/" element={<FluidsPage />} />
          <Route path="/fluids/pressure-density" element={<DensityPage />} />
          <Route path="/fluids/density" element={<DensityPage />} />
          <Route path="/fluids/specific-gravity" element={<SpecificGravityPage />} />
          <Route path="/fluids/archimedes" element={<ArchimedesPage />} />
          <Route path="/fluids/rate-of-flow" element={<RateOfFlowPage />} />
        

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;