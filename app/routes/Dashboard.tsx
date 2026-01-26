import { Outlet } from "react-router";
// import type { Route } from "./+types/Dashboard";

export async function loader() {}

export async function action() {}

export default function Dashboard() {
  return (
    <div className="mt-20">
      <Outlet />
    </div>
  )
}
