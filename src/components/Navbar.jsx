import { useState } from "react";
import "./css/Navbar.css";

export default function Navbar({ onSelect }) {
  const [active, setActive] = useState("Daily Tracker");

  const handleClick = (menu) => {
    setActive(menu);
    onSelect(menu);
  };

  return (
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
      </ul>
    </nav>
  );
}
