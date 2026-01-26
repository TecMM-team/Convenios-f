import "./styles/Login.css";
import LoginInfoPanel from "../components/Login/LoginInfoPanel";
import LoginForm from "../components/Login/LoginForm";

export default function Login() {
  return (
    <div className="login-container">
      <LoginInfoPanel />
      <LoginForm />
    </div>
  );
}
