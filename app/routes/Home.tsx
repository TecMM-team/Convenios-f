import type { Route } from "./+types/Home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inicio" },
    { name: "description", content: "Home page" },
  ];
}

export default function Home() {
  return <div>Home</div>;
}
