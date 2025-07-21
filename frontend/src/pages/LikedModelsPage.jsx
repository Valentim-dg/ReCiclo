import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import ModelGrid from "../components/ModelGrid";
import { transformModelsData } from "../utils/modelTransformer";

/**
 * Componente LikedModelsPage
 * Uma página dedicada a exibir todos os modelos que o utilizador autenticado curtiu.
 * Busca os dados do endpoint '/api/models3d/liked/' e permite que o utilizador
 * descurta um modelo diretamente a partir desta página.
 */
const LikedModelsPage = () => {
  const [likedModels, setLikedModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Busca a lista de modelos curtidos pelo utilizador a partir da API.
   * A função é memorizada com useCallback para otimizar o desempenho.
   */
  const fetchLikedModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("Você precisa estar logado para ver seus likes.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/models3d/liked/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setLikedModels(
        transformModelsData(response.data.results || response.data)
      );
    } catch (err) {
      console.error("Erro ao buscar modelos curtidos:", err);
      setError("Não foi possível carregar seus modelos curtidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeito para buscar os dados quando o componente é montado.
  useEffect(() => {
    fetchLikedModels();
  }, [fetchLikedModels]);

  /**
   * Lida com a ação de descurtir um modelo.
   * Realiza uma "atualização otimista" na UI, removendo o modelo da lista
   * instantaneamente, e depois envia a requisição para a API.
   * @param {number} id - O ID do modelo a ser descurtido.
   */
  const handleLike = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Remove o modelo da UI imediatamente para uma resposta rápida.
    setLikedModels((prevModels) =>
      prevModels.filter((model) => model.id !== id)
    );

    try {
      // Envia a requisição para o backend para de fato descurtir.
      await axios.post(
        `http://127.0.0.1:8000/api/models3d/${id}/like/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
    } catch (error) {
      console.error("Erro ao descurtir o modelo:", error);
      // Em caso de erro, re-busca os dados para garantir consistência.
      fetchLikedModels();
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
          <Heart className="w-10 h-10 text-red-500" />
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Modelos Curtidos
            </h1>
            <p className="text-slate-600 mt-1">
              Aqui estão todos os modelos que você curtiu.
            </p>
          </div>
        </header>

        {likedModels.length > 0 ? (
          <ModelGrid models={likedModels} onLike={handleLike} />
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-slate-700">
              Nenhum modelo curtido ainda
            </h3>
            <p className="text-slate-500 mt-2">
              Explore os modelos e clique no coração para salvá-los aqui!
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

export default LikedModelsPage;
