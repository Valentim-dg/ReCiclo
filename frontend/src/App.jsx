import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./pages/Home";

const App = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <Router>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/* Sidebar controla a expansão */}
        <Sidebar
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
        />

        {/* Conteúdo principal */}
        <div className="flex-1 transition-all duration-300">
          {/* Header no topo */}
          <Header isSidebarExpanded={isSidebarExpanded} />

          {/* Área das páginas, com espaço para o header */}
          <div className="mt-16">
            <Routes>
              <Route
                path="/"
                element={<Home isSidebarExpanded={isSidebarExpanded} />}
              />
              <Route path="/profile" element={<h1>Meu Perfil</h1>} />
              <Route path="/likes" element={<h1>Likes</h1>} />
              <Route path="/favorites" element={<h1>Favoritos</h1>} />
              <Route path="/settings" element={<h1>Configurações</h1>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
