import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import EditAccount from "./pages/EditAccount";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import StoryIntro from "./pages/StoryIntro";
import QuestHydrostatic from "./pages/QuestHydrostatic";
import PlumberHouse from "./pages/PlumberHouse";
import LaboratoryQuest from "./pages/LaboratoryQuest";
import Sandbox from "./pages/Sandbox";
import Achievements from "./pages/Achievements";
import AchievementToaster from "./components/AchievementToaster";
import EndlessHub from "./features/endless/EndlessHub";
import EndlessRun from "./features/endless/EndlessRun";

import Overview from "./features/Overview";
import FluidsPage from "./features/01_fluids/page";
import DensityPage from "./features/02_density/page";
import SpecificGravityPage from "./features/03_specific-gravity/page";
import ArchimedesPage from "./features/04_archimedes/page";
import RateOfFlowPage from "./features/05_rate-of-flow/page";

function App() {
  return (
    <div className="page-shell">
      <Navbar />
      <AchievementToaster />

      <main className="page-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/intro" element={<StoryIntro />} />
          <Route path="/quest/hydrostatic-pressure" element={<QuestHydrostatic />} />
          <Route path="/quest/plumber-house" element={<PlumberHouse />} />
          <Route path="/quest/laboratory" element={<LaboratoryQuest />} />
          <Route path="/sandbox/:lessonId" element={<Sandbox />} />
          <Route path="/endless" element={<EndlessHub />} />
          <Route path="/endless/:questId" element={<EndlessRun />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/account/edit" element={<EditAccount />} />
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