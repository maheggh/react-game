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

const App = () => {
  return (
    <Router>
      <NavBar />
      <Routes>
        {/* Home page (registration/login) */}
        <Route path="/" element={<Home />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

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
          path="/Bosses"
          element={
            <ProtectedRoute>
              <Bosses />
            </ProtectedRoute>
          }
        />
                                  <Route
          path="/Score"
          element={
            <ProtectedRoute>
              <ScoreScreen />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;