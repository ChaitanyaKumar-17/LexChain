// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.jsx";
import Verify from "./pages/Verify.jsx"; 
import Upload from "./pages/Upload.jsx";
import Sign from "./pages/Sign.jsx"; 
import Protected from "./components/Protected.jsx";
import Admin from "./pages/Admin.jsx";
import { Web3Provider } from "./context/Web3Context.jsx";

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        {/* Viewport locked to exact screen height with dark base background */}
        <div className="h-screen flex flex-col bg-legal-base overflow-hidden">
          <NavigationBar />
          
          <main className="flex-1 overflow-y-auto w-full max-w-6xl mx-auto p-4 pb-12">
            <Routes>
              <Route path="/" element={<Verify />} />
              <Route path="/upload" element={<Protected requireLawyer={true}><Upload /></Protected>} />
              <Route path="/sign" element={<Protected><Sign /></Protected>} />
              <Route path="/admin" element={<Protected requireAdmin={true}><Admin/></Protected>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </Web3Provider>
  );
}

export default App;