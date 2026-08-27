import { Link } from "react-router-dom";

interface ServerErrorProps {
  status?: number;
}

export function ServerError({ status = 500 }: ServerErrorProps) {
  return (
    <div>
      <h1>{status} - Server Error</h1>
      <p>An unexpected error occurred. Please try again.</p>
      <button onClick={() => window.location.reload()}>Reload page</button>
      <br />
      <Link to="/">Go back home</Link>
    </div>
  );
}
