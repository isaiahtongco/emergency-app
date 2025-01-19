
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OverviewPage from "./pages/OverviewPage.js";
import CreateRecordMass from "./pages/CreateRecordMass.js";
import CreateRecordManual from "./pages/CreateRecordManual.js";
import ViewRecords from "./pages/ViewRecords.js";
import MonitorEmergency from "./pages/MonitorEmergency.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/create-mass" element={<CreateRecordMass />} />
        <Route path="/create-manual" element={<CreateRecordManual />} />
        <Route path="/view-records" element={<ViewRecords />} />
        <Route path="/monitor-emergency" element={<MonitorEmergency />} />
      </Routes>
    </Router>
  );
};

export default App;