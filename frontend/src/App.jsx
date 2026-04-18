// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.jsx";
import Verify from "./pages/Verify.jsx"; 
import Upload from "./pages/Upload.jsx";
import Sign from "./pages/Sign.jsx"; 
import Protected from "./components/Protected.jsx";
import Admin from "./pages/Admin.jsx";
import { Web3Provider } from "./context/Web3Context.jsx";
import { MonitorSmartphone } from "lucide-react"; // NEW: Icon for the mobile blocker

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        
        {/* =========================================
            MOBILE BLOCKER SCREEN
            Visible only on screens < 768px width
        ========================================= */}
        <div className="flex md:hidden h-screen w-screen bg-legal-base flex-col items-center justify-center p-8 text-center overscroll-none overflow-hidden">
          <div className="bg-legal-muted/40 p-6 rounded-full mb-8 border border-legal-muted shadow-lg">
            <MonitorSmartphone size={56} className="text-seal-crimson" />
          </div>
          <h2 className="text-2xl font-header font-bold text-text-dark-headers mb-4 tracking-tight">
            Desktop Environment Required
          </h2>
          <p className="text-text-dark-secondary leading-relaxed text-sm">
            LexChain is an enterprise-grade blockchain platform optimized for desktop environments and secure browser wallets. 
            <br/><br/>
            Please access this application using a PC or laptop for the full professional experience.
          </p>
        </div>

        {/* =========================================
            MAIN APPLICATION
            Hidden on mobile, visible on >= 768px
        ========================================= */}
        <div className="hidden md:flex h-screen flex-col bg-legal-base overflow-hidden">
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