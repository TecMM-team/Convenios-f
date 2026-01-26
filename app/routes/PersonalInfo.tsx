import InputField from "~/common/TextField/InputField";
import type { Route } from "./+types/PersonalInfo";

export async function loader({ params }: Route.LoaderArgs) { }

export async function action({ params }: Route.LoaderArgs) { }

export default function PersonalInfo({ loaderData }: Route.ComponentProps) {
  return (
    <>
    <InputField text="Personal" size="30dvw"/>
    </>
  )
}
