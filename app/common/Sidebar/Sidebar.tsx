import "./Sidebar.css";
import { useNavigate } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import type { ReactNode } from "react";
import IsotipoTSJ from "../../assets/logos/IsotipoTSJ.svg";

interface MenuItem {
  icon: ReactNode;
  label: string;
  path: string;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout, setNoti } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mainMenu: MenuItem[] = [
    { icon: <AssignmentIcon />, label: "Convenios", path: "/convenios" },
    ...(user?.rol === "Coordinador" || user?.rol === "Administrador"
      ? [{ icon: <ContactMailIcon />, label: "Cuentas", path: "/cuentas" }]
      : []),
  ];

  const handleLogout = () => {
    setNoti({
      open: true,
      type: "info",
      message: "Cerrando sesión...",
    });
    logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  // Cerrar sidebar al hacer clic fuera (modo móvil)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.querySelector(".sidebar");
      const button = document.querySelector(".hamburger-button");
      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        !button?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* 🔹 Navbar visible solo en móvil */}
      <header className="mobile-navbar">
        <div className="hamburger-button" onClick={() => setIsOpen(!isOpen)}>
          <MenuIcon />
        </div>
        <h1 className="navbar-title">Panel de Control</h1>
      </header>

      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar-header">
          <img src={IsotipoTSJ} alt="Isotipo TSJ" className="header-logo" />
          {(isHovered || isOpen) && (
            <div className="header-text">
              <h2>Panel de Control</h2>
              <p>{user?.rol || "Usuario"}</p>
            </div>
          )}
        </div>

        <nav className="sidebar-menu">
          <ul>
            {mainMenu.map((item, index) => (
              <li
                key={index}
                className="menu-item"
                onClick={() => handleNavigate(item.path)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div
            className="menu-item"
            onClick={() => handleNavigate("/configuracion")}
          >
            <span className="menu-icon">
              <SettingsIcon />
            </span>
            <span className="menu-label">Configuración</span>
          </div>

          <div className="menu-item logout" onClick={handleLogout}>
            <span className="menu-icon">
              <LogoutIcon />
            </span>
            <span className="menu-label">Cerrar Sesión</span>
          </div>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" />}
    </>
  );
}
