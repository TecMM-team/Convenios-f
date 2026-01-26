import { Outlet } from "react-router";
import Sidebar from "~/common/Sidebar/Sidebar";
import "./ProtectedLayout.css";

export default function ProtectedLayout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
