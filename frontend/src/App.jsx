import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./pages/Home";
import ModelDetails from "./components/ModelDetails";
import { Heart, Bookmark, User, Settings, HomeIcon } from "lucide-react";

const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/* Sidebar controla a expansão */}
        <Sidebar>
          <SidebarItem icon={<HomeIcon size={20} />} text="Início" active />
          <SidebarItem icon={<User size={20} />} text="Perfil" />
          <SidebarItem icon={<Heart size={20} />} text="Likes" />
          <SidebarItem icon={<Bookmark size={20} />} text="Favoritos" />
          <SidebarItem icon={<Settings size={20} />} text="Configurações" />
        </Sidebar>

        {/* Conteúdo principal */}
        <div className={`flex-1 transition-all duration-300 `}>
          {/* Header no topo */}
          <Header />

          {/* Área das páginas, com espaço para o header */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/models/:id" element={<ModelDetails />} />
            <Route path="/profile" element={<h1>Meu Perfil</h1>} />
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
