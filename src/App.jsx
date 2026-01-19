import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HabitTracker from "./components/HabitTracker";
import MoneyManagement from "./components/MoneyManagement";

function App() {
  const [activePage, setActivePage] = useState("Daily Tracker");

  return (
    <div className="app-container">
      <Navbar onSelect={setActivePage} />

      <main className="main-content">
        {activePage === "Daily Tracker" && <HabitTracker />}
        {activePage === "Money Management" && <MoneyManagement />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
