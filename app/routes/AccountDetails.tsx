import type { Route } from "./+types/Home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inicio" },
    { name: "description", content: "Account Details Page" },
  ];
}

export default function AccountDetails() {
  return (
    <div>
      Accountetails
    </div>
  )
}
