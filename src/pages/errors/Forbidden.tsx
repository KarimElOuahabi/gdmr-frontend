import { Link } from "react-router-dom";

export function Forbidden() {
  return (
    <div>
      <h1>403 - Access Denied</h1>
      <p>You don't have permission to access this resource.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
}
