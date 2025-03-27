import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Sidebar, { SidebarItem } from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./pages/Home";
import ModelDetails from "./pages/ModelDetails";
import Dashboard from "./components/Dashboard";

const App = () => {
  const [user, setUser] = useState(null);
  const [models, setModels] = useState([]);

  useEffect(() => {
    // Recupera o usuário do localStorage ao iniciar
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen w-full  ">
        {/* Conteúdo principal */}
        <div className={`flex-1 transition-all duration-300 `}>
          {/* Header no topo */}
          <Header user={user} setUser={setUser} setModels={setModels} />

          {/* Área das páginas, com espaço para o header */}
          <Routes>
            <Route
              path="/"
              element={<Home user={user} setModels={setModels} />}
            />
            <Route path="/models/:id" element={<ModelDetails />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/profile" element={<Dashboard user={user} />} />
            <Route path="/likes" element={<h1>Likes</h1>} />
            <Route path="/favorites" element={<h1>Favoritos</h1>} />
            <Route path="/settings" element={<h1>Configurações</h1>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
