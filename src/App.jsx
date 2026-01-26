import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HabitTracker from "./components/HabitTracker";
import MoneyManagement from "./components/MoneyManagement";
import Auth from "./components/Auth";

function App() {
  // 1. Inisialisasi state dari localStorage agar saat refresh data tidak hilang
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("lastActivePage") || "Daily Tracker";
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // 2. Gunakan useEffect untuk memantau perubahan activePage dan menyimpannya ke localStorage
  useEffect(() => {
    localStorage.setItem("lastActivePage", activePage);
  }, [activePage]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // Saat login, arahkan ke default atau ambil dari penyimpanan
    setActivePage("Daily Tracker");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastActivePage"); // Opsional: hapus histori halaman saat logout
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Pastikan Navbar memanggil setActivePage saat menu diklik */}
      <Navbar
        onSelect={setActivePage}
        activePage={activePage} // Kirim ini agar Navbar tahu mana yang aktif
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activePage === "Daily Tracker" && <HabitTracker />}
        {activePage === "Money Management" && <MoneyManagement />}
      </main>

      <Footer />
    </div>
  );
}

export default App;