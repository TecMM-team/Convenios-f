import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import Breadcrumbs from "~/common/Breadcrumbs/Breadcrumbs";
import AccountsHeader from "~/components/Accounts/AccountsHeader";
import AccountsTable from "~/components/Accounts/AccountsTable";
import "./styles/Accounts.css";
import UpdateAccounts from "~/components/Accounts/updateAccounts";

export default function Accounts() {
  const location = useLocation();
  const isRoot = location.pathname === "/cuentas";
  const [searchQuery, setSearchQuery] = useState("");
  const [modo, setModo] = useState("tabla");
  const [seleccion, setSeleccion] = useState([]);

  return (
    <div>
      {!isRoot && (
        <Breadcrumbs
          items={[
            { label: "Gestión de Cuentas", path: "/cuentas" },
            { label: "Alta de Cuenta", path: "/crear" },
          ]}
        />
      )}

      {isRoot ? (
        modo === "tabla" ? (
          <>
            <AccountsHeader onSearch={setSearchQuery} />
            <AccountsTable query={searchQuery} setModo={setModo} setSelecccion={setSeleccion}/>
          </>
        ) : (
          <>
            <UpdateAccounts setModo={setModo} setSelecccion={setSeleccion} seleccion={seleccion}/>
          </>
        )
      ) : (
        <Outlet />
      )}
    </div>
  );
}



