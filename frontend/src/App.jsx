// App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CarRaces from "./pages/CarRaces";
import CarTheft from "./pages/CarTheft";
import Login from './components/Login'; // Import Login component
import NavBar from "./components/NavBar"; 
import ProtectedRoute from "./components/ProtectedRoute"; 
import Theft from "./pages/Theft";
import Gambling from "./pages/Gambling";
import WeaponStore from "./pages/WeaponStore";
import Bosses from "./pages/Bosses";
import ScoreScreen from "./pages/Score";
import Assassination from "./pages/Assassination";
import RankNavbar from "./components/RankNavBar";
import DeadPage from "./components/DeadPage"; // Corrected Import

const App = () => {
  return (
    <Router>
      <NavBar />
      <RankNavbar /> {/* Ensure consistent layout */}
      <Routes>
        {/* Home page (registration/login) */}
        <Route path="/" element={<Home />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Dead Page */}
        <Route path="/dead" element={<DeadPage />} /> {/* Updated Route Path */}

        {/* Protected Routes */}
        <Route
          path="/carraces"
          element={
            <ProtectedRoute>
              <CarRaces />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cartheft"
          element={
            <ProtectedRoute>
              <CarTheft />
            </ProtectedRoute>
          }
        />
        <Route
          path="/theft"
          element={
            <ProtectedRoute>
              <Theft />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gambling"
          element={
            <ProtectedRoute>
              <Gambling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weaponstore"
          element={
            <ProtectedRoute>
              <WeaponStore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bosses" /* Changed to lowercase */
          element={
            <ProtectedRoute>
              <Bosses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/score" /* Changed to lowercase */
          element={
            <ProtectedRoute>
              <ScoreScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assassination" /* Changed to lowercase */
          element={
            <ProtectedRoute>
              <Assassination />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
