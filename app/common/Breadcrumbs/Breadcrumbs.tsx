import { useNavigate } from "react-router";
import "./Breadcrumbs.css";

interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const navigate = useNavigate();

  return (
    <nav className="breadcrumbs">
      {items.map((item, index) => (
        <span
          key={index}
          className={`crumb ${
            item.active ? "active" : item.onClick || item.path ? "clickable" : ""
          }`}
          onClick={() => {
            if (item.onClick) item.onClick();
            else if (item.path) navigate(item.path);
          }}
        >
          {item.label}
          {index < items.length - 1 && <span className="separator">›</span>}
        </span>
      ))}
    </nav>
  );
}
