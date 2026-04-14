import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.jsx";
import Verify from "./pages/Verify.jsx";
import Upload from "./pages/Upload.jsx";
import Protected from "./components/Protected.jsx";
import Admin from "./pages/Admin.jsx";
import { Web3Provider } from "./context/Web3Context.jsx";

function App() {
  return (
    <Web3Provider>

    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        {/* Navigation Bar */}
        <NavigationBar />

        {/* Page Content */}
        <main className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
          <Routes>
            <Route path="/" element={<Verify />} />
            <Route
              path="/upload"
              element={
                <Protected>
                  <Upload />
                </Protected>
              }
              />
            <Route
              path="/admin"
              element={
                <Protected requireAdmin={true}>
                  <Admin/>
                </Protected>
              }
              />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
              </Web3Provider>
  );
}

export default App;
