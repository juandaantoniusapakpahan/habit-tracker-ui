import { useState } from "react";
import "./css/Navbar.css";

export default function Navbar({ onSelect, onLogout }) {
  const [active, setActive] = useState("Daily Tracker");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleClick = (menu) => {
    setActive(menu);
    onSelect(menu);
  };

  // Komponen Ikon SVG (Warna stroke diatur lewat CSS atau props)
  const LogOutIcon = ({ size = 20, color = "currentColor" }) => (
    <svg 
      width={size} height={size} 
      viewBox="0 0 24 24" fill="none" 
      stroke={color} strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">TrackerApp</div>
        <ul className="navbar-menu">
          {["Daily Tracker", "Money Management"].map((menu) => (
            <li
              key={menu}
              className={active === menu ? "active" : ""}
              onClick={() => handleClick(menu)}
            >
              {menu}
            </li>
          ))}
          
          {/* Ikon Logout Putih di Navbar */}
          <li className="logout-icon-wrapper" onClick={() => setShowLogoutModal(true)}>
            <LogOutIcon size={20} color="white" />
          </li>
        </ul>
      </nav>

      {/* Pop-up Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="icon-circle-danger">
                {/* Ikon Merah di dalam Modal sebagai peringatan */}
                <LogOutIcon size={32} color="#ff4d4d" />
              </div>
            </div>
            <h3>Keluar dari Aplikasi?</h3>
            <p>Sesi Anda akan berakhir dan Anda harus login kembali.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Batal
              </button>
              <button className="btn-confirm" onClick={onLogout}>
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}