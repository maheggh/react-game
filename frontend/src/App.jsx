import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import CarRaces from "./pages/CarRaces";
import CarTheft from "./pages/CarTheft";
import AuthPage from './pages/AuthPage';
import NavBar from "./components/NavBar"; 
import ProtectedRoute from "./components/ProtectedRoute"; 
import Theft from "./pages/Theft";
import Gambling from "./pages/Gambling";
import WeaponStore from "./pages/WeaponStore";
import Bosses from "./pages/Bosses";
import ScoreScreen from "./pages/Score";
import Assassination from "./pages/Assassination";
import RankNavbar from "./components/RankNavBar";
import DeadPage from "./pages/DeadPage"; 
import { AuthProvider, AuthContext } from './context/AuthContext';  

const AppContent = () => {
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <Router>
      {isLoggedIn && <NavBar />}
      {isLoggedIn && <RankNavbar />}
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dead" element={<DeadPage />} />
        <Route path="/carraces" element={<ProtectedRoute><CarRaces /></ProtectedRoute>} />
        <Route path="/cartheft" element={<ProtectedRoute><CarTheft /></ProtectedRoute>} />
        <Route path="/theft" element={<ProtectedRoute><Theft /></ProtectedRoute>} />
        <Route path="/gambling" element={<ProtectedRoute><Gambling /></ProtectedRoute>} />
        <Route path="/weaponstore" element={<ProtectedRoute><WeaponStore /></ProtectedRoute>} />
        <Route path="/bosses" element={<ProtectedRoute><Bosses /></ProtectedRoute>} />
        <Route path="/score" element={<ProtectedRoute><ScoreScreen /></ProtectedRoute>} />
        <Route path="/assassination" element={<ProtectedRoute><Assassination /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
