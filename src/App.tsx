import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DownloadPage } from "@/pages/DownloadPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DownloadPage />} />
      </Routes>
    </Router>
  );
}
