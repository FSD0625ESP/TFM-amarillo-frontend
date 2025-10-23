import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RequestMagicLink from "./pages/RequestMagicLink";
import UserRegistration from "./pages/UserRegistration";
import Home from "./pages/Home";
import AdminPage from "./components/LoginAdmin";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} /> 
        <Route path="/" element={<RequestMagicLink />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/admin" element={<AdminPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
