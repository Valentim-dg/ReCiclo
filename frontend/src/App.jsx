import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Componentes e Páginas
import Header from "./components/Header";
import Home from "./pages/Home";
import ModelDetails from "./pages/ModelDetails";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import LikedModelsPage from "./pages/LikedModelsPage";
import ProfilePage from "./pages/ProfilePage";
import SavedModelsPage from "./pages/SavedModelsPage";
import PublicProfilePage from "./pages/PublicProfilePage";

/**
 * Componente App
 * O componente raiz da aplicação. É responsável por gerir o estado global dos dados
 * (como a lista de modelos e a pesquisa), a configuração das rotas e a renderização
 * dos componentes principais como o Header e as páginas.
 */
const App = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [models, setModels] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  /**
   * Busca a lista de modelos 3D da API, aplicando um termo de pesquisa opcional.
   * A função é memorizada com useCallback para otimizar o desempenho.
   */
  const fetchModels = useCallback(async (searchTerm = "") => {
    setIsLoadingModels(true);
    const token = localStorage.getItem("authToken");
    const headers = token ? { Authorization: `Token ${token}` } : {};
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/models3d/?search=${searchTerm}`,
        { headers }
      );
      setModels(response.data.results || response.data);
    } catch (error) {
      console.error("Erro ao buscar modelos na API:", error);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  // Efeito que re-busca os modelos sempre que a query (termo de busca) ou o estado de autenticação (user) mudam.
  useEffect(() => {
    fetchModels(query);
  }, [query, user, fetchModels]);

  // Exibe um ecrã de carregamento global enquanto o AuthContext verifica a sessão do utilizador.
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header onSearch={setQuery} onActionComplete={fetchModels} />

        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={<Home models={models} isLoading={isLoadingModels} />}
            />
            <Route path="/marketplace" element={<Marketplace user={user} />} />
            <Route path="/models/:id" element={<ModelDetails />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route
              path="/profile"
              element={<ProfilePage onModelsChange={fetchModels} />}
            />
            <Route path="/users/:username" element={<PublicProfilePage />} />
            <Route path="/likes" element={<LikedModelsPage user={user} />} />
            <Route
              path="/favorites"
              element={<SavedModelsPage user={user} />}
            />
            <Route path="/settings" element={<h1>Configurações</h1>} />
          </Routes>
        </main>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
};

export default App;
