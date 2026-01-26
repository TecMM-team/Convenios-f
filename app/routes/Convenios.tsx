import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import Breadcrumbs from "~/common/Breadcrumbs/Breadcrumbs";
import ConveniosHeader from "~/components/Convenios/ConveniosHeader";
import ConveniosTable, { type Convenio } from "~/components/Convenios/ConveniosTable"; 

export default function Accounts() {
  const location = useLocation();
  const isRoot = location.pathname === "/convenios";
  const [searchQuery, setSearchQuery] = useState("");
  const [modo, setModo] = useState("tabla");
  const [seleccion, setSeleccion] = useState<Convenio | null>(null);

  return (
    <div>
      {!isRoot && (
        <Breadcrumbs
          items={[
            { label: "Gestión de Convenios", path: "/convenios" },
            { label: "Alta de Convenio" },
          ]}
        />
      )}

      {isRoot ? (
        modo === "tabla" ? (
          <>
            <ConveniosHeader onSearch={setSearchQuery} />
            <ConveniosTable query={searchQuery} setModo={setModo} setSelecccion={setSeleccion}/>
          </>
        )
         : (<Outlet context={{ modo, setModo, seleccion, setSeleccion }} />
        )
      ) : (
        <Outlet context={{ modo, setModo, seleccion, setSeleccion }} />
      )}
    </div>
  );

}