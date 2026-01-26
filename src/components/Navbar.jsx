import { useState } from "react";
import "./css/Navbar.css";

export default function Navbar({ onSelect, onLogout, activePage }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State untuk mobile menu

  const handleClick = (menu) => {
    onSelect(menu);
    setIsOpen(false); // Tutup menu setelah memilih (di mobile)
  };

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

        {/* Hamburger Icon untuk Mobile */}
        <div className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span className={isOpen ? "bar open" : "bar"}></span>
          <span className={isOpen ? "bar open" : "bar"}></span>
          <span className={isOpen ? "bar open" : "bar"}></span>
        </div>

        {/* Tambahkan class 'open' jika isOpen true */}
        <ul className={`navbar-menu ${isOpen ? "open" : ""}`}>
          {["Daily Tracker", "Money Management"].map((menu) => (
            <li
              key={menu}
              className={activePage === menu ? "active" : ""}
              onClick={() => handleClick(menu)}
            >
              {menu}
            </li>
          ))}
          
          <li className="logout-button-mobile" onClick={() => {
            setShowLogoutModal(true);
            setIsOpen(false);
          }}>
            Logout
          </li>

          <li className="logout-icon-desktop" onClick={() => setShowLogoutModal(true)}>
            <LogOutIcon size={20} color="white" />
          </li>
        </ul>
      </nav>

      {/* Modal Logout */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="icon-circle-danger">
              <LogOutIcon size={32} color="#ff4d4d" />
            </div>
            <h3>Keluar dari Aplikasi?</h3>
            <p>Sesi Anda akan berakhir dan Anda harus login kembali.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Batal</button>
              <button className="btn-confirm" onClick={onLogout}>Keluar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}