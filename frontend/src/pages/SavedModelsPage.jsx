import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Bookmark, ArrowLeft, Loader2 } from "lucide-react";
import ModelGrid from "../components/ModelGrid";
import { transformModelsData } from "../utils/modelTransformer";

/**
 * Componente SavedModelsPage
 * Uma página dedicada a exibir todos os modelos que o utilizador autenticado salvou como favoritos.
 * Busca os dados do endpoint '/api/models3d/saved/' e permite que o utilizador
 * remova um modelo dos seus favoritos diretamente a partir desta página.
 */
const SavedModelsPage = () => {
  const [savedModels, setSavedModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Busca a lista de modelos salvos pelo utilizador a partir da API.
   * A função é memorizada com useCallback para otimizar o desempenho.
   */
  const fetchSavedModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Você precisa estar logado para ver seus modelos salvos.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/models3d/saved/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setSavedModels(
        transformModelsData(response.data.results || response.data)
      );
    } catch (err) {
      console.error("Erro ao buscar modelos salvos:", err);
      setError("Não foi possível carregar seus modelos salvos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para buscar os dados quando o componente é montado.
  useEffect(() => {
    fetchSavedModels();
  }, [fetchSavedModels]);

  /**
   * Lida com a ação de remover um modelo dos salvos.
   * Realiza uma "atualização otimista" na UI, removendo o modelo da lista
   * instantaneamente, e depois envia a requisição para a API.
   * @param {number} id - O ID do modelo a ser removido dos salvos.
   */
  const handleUnsave = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Remove o modelo da UI imediatamente para uma resposta rápida.
    setSavedModels((prevModels) =>
      prevModels.filter((model) => model.id !== id)
    );

    try {
      // Envia a requisição para o backend para de fato remover dos salvos.
      await axios.post(
        `http://127.0.0.1:8000/api/models3d/${id}/save/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
    } catch (error) {
      console.error("Erro ao remover modelo dos salvos:", error);
      // Em caso de erro, re-busca os dados para garantir consistência.
      fetchSavedModels();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <Link
          to="/"
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <ArrowLeft className="mr-2" size={16} />
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
          >
            <ArrowLeft
              className="mr-2 group-hover:-translate-x-1 transition-transform"
              size={20}
            />
            <span className="font-medium">Voltar para o Perfil</span>
          </Link>
        </div>
        <header className="flex items-center gap-4 mb-8">
          <Bookmark className="w-10 h-10 text-blue-500" />
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Modelos Salvos
            </h1>
            <p className="text-slate-600 mt-1">
              Aqui estão todos os seus modelos favoritos.
            </p>
          </div>
        </header>

        {savedModels.length > 0 ? (
          <ModelGrid models={savedModels} onSave={handleUnsave} />
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-700">
              Nenhum modelo salvo ainda
            </h3>
            <p className="text-slate-500 mt-2">
              Explore os modelos e clique no ícone de "Salvar" para adicioná-los
              aqui!
            </p>
            <Link
              to="/"
              className="mt-6 inline-block bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Modelos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedModelsPage;
