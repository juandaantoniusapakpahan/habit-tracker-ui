import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HabitTracker from "./components/HabitTracker";
import MoneyManagement from "./components/MoneyManagement";
import Auth from "./components/Auth";

function App() {
  // 1. Inisialisasi state dari localStorage
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("lastActivePage") || "Daily Tracker";
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  // --- LOGIKA PENANGKAP TOKEN GITHUB (OAUTH2) ---
  useEffect(() => {
    // Ambil query string dari URL (misal: ?token=ey...)
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      // Simpan ke localStorage agar konsisten dengan login biasa
      localStorage.setItem("token", tokenFromUrl);
      
      // Update state agar tampilan langsung berubah ke dashboard
      setIsAuthenticated(true);
      setActivePage("Daily Tracker");

      // Hapus token dari URL address bar agar bersih dan aman
      window.history.replaceState({}, document.title, "/");
      
      console.log("Login GitHub Berhasil");
    }
  }, []); // Berjalan sekali saat aplikasi di-load

  // 2. Pantau perubahan activePage
  useEffect(() => {
    localStorage.setItem("lastActivePage", activePage);
  }, [activePage]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActivePage("Daily Tracker");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastActivePage");
    setIsAuthenticated(false);
  };

  // Jika belum login, tampilkan layar Auth (yang sekarang sudah ada tombol GitHub-nya)
  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Navbar
        onSelect={setActivePage}
        activePage={activePage}
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