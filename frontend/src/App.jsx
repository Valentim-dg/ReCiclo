import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Sidebar, { SidebarItem } from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./pages/Home";
import ModelDetails from "./pages/ModelDetails";
import Dashboard from "./pages/Dashboard";
// import LevelUpNotification from "./components/LevelUpNotification";

const App = () => {
  const [user, setUser] = useState(null);
  const [models, setModels] = useState([]);
  // const [levelUpNotification, setLevelUpNotification] = useState(null);

  // Referência para a função updateDashboard
  const dashboardUpdateRef = useRef(null);

  // Função que será chamada pelo Header
  const updateDashboardFromHeader = () => {
    if (dashboardUpdateRef.current) {
      dashboardUpdateRef.current();
    }
  };

  useEffect(() => {
    // Recupera o usuário do localStorage ao iniciar
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Função para verificar e atualizar nível do usuário
  const checkAndUpdateLevel = (updatedUser) => {
    if (user && updatedUser && updatedUser.level > user.level) {
      // setLevelUpNotification(updatedUser.level);
    }

    // Atualiza o usuário no estado e no localStorage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <Router>
      <div className="flex min-h-screen w-full">
        {/* Conteúdo principal */}
        <div className="flex-1 transition-all duration-300">
          {/* Header no topo */}
          <Header
            user={user}
            setUser={checkAndUpdateLevel}
            setModels={setModels}
            updateDashboard={updateDashboardFromHeader}
          />

          {/* Área das páginas, com espaço para o header */}
          <Routes>
            <Route
              path="/"
              element={<Home user={user} setModels={setModels} />}
            />
            <Route path="/models/:id" element={<ModelDetails user={user} />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  user={user}
                  ref={(dashboard) => {
                    // Salva a referência do método updateDashboard quando o componente é montado
                    if (dashboard) {
                      dashboardUpdateRef.current = dashboard.updateDashboard;
                    }
                  }}
                  onUserUpdate={checkAndUpdateLevel}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <Dashboard
                  user={user}
                  ref={(dashboard) => {
                    if (dashboard) {
                      dashboardUpdateRef.current = dashboard.updateDashboard;
                    }
                  }}
                  onUserUpdate={checkAndUpdateLevel}
                />
              }
            />
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
