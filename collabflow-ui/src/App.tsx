import { Routes, Route } from "react-router-dom";
import AuthForm from "./components/auth/AuthForm";
import { Toaster } from "sonner";


export default function App() {
  return (
    <>
    <Routes>
          <Route path="/login" element={<AuthForm />} />
    </Routes>
    <Toaster richColors closeButton />
    </>
  );
}
