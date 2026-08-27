import { AppRouter } from "./routes/AppRouter";
import { Toaster } from "@/components/ui/toast";

function App() {
  return (
    <Toaster>
      <AppRouter />
    </Toaster>
  );
}

export default App;
