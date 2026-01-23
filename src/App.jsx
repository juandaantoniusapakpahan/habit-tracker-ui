import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HabitTracker from "./components/HabitTracker";
import MoneyManagement from "./components/MoneyManagement";
import Auth from "./components/Auth"; 

function App() {
  const [activePage, setActivePage] = useState("Daily Tracker");
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActivePage("Daily Tracker");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }


  return (
    <div className="app-container">
      <Navbar onSelect={setActivePage} onLogout={handleLogout} />

      <main className="main-content">
        {activePage === "Daily Tracker" && <HabitTracker />}
        {activePage === "Money Management" && <MoneyManagement />}
        
      </main>

      <Footer />
    </div>
  );
}

export default App;
