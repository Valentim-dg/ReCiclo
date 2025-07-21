import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { transformModelsData } from "../utils/modelTransformer";
import ModelGrid from "../components/ModelGrid";

/**
 * Componente Home
 * A página principal que exibe o grid de modelos 3D.
 * Utiliza `forwardRef` para expor uma função `updateModels` ao componente pai,
 * permitindo que a lista de modelos seja atualizada externamente (ex: após uma pesquisa).
 * @param {{
 * models: object[],
 * isLoading: boolean
 * }} props - As propriedades do componente.
 * @param {object[]} props.models - A lista inicial de modelos a ser exibida, vinda do componente pai.
 * @param {boolean} props.isLoading - Indica se a lista principal de modelos está a ser carregada.
 */
const Home = forwardRef(
  ({ models: initialModels, isLoading: isLoadingModels }, ref) => {
    const { user } = useAuth(); // Pega o utilizador autenticado do contexto global.
    const [localModels, setLocalModels] = useState([]);

    // Expõe um método para o componente pai poder atualizar os modelos exibidos.
    useImperativeHandle(ref, () => ({
      updateModels: (newModels) => {
        setLocalModels(transformModelsData(newModels));
      },
    }));

    // Efeito para carregar os modelos iniciais recebidos via props.
    useEffect(() => {
      if (initialModels) {
        setLocalModels(transformModelsData(initialModels));
      }
    }, [initialModels]);

    /**
     * Lida com a ação de curtir/descurtir um modelo.
     * Realiza uma "atualização otimista" na UI para uma resposta imediata e, em seguida,
     * envia a requisição para a API. Reverte a alteração se a API falhar.
     * @param {number} id - O ID do modelo a ser curtido.
     */
    const handleLike = async (id) => {
      if (!user) {
        toast.info("Você precisa estar logado para curtir um modelo.");
        return;
      }

      const originalModels = [...localModels];
      setLocalModels((prevModels) =>
        prevModels.map((model) =>
          model.id === id
            ? {
                ...model,
                isLiked: !model.isLiked,
                likes: model.isLiked ? model.likes - 1 : model.likes + 1,
              }
            : model
        )
      );

      try {
        const token = localStorage.getItem("authToken");
        await axios.post(
          `http://127.0.0.1:8000/api/models3d/${id}/like/`,
          {},
          { headers: { Authorization: `Token ${token}` } }
        );
      } catch (error) {
        console.error("Erro ao dar like:", error);
        toast.error("Ocorreu um erro ao processar a sua curtida.");
        setLocalModels(originalModels); // Reverte a UI em caso de erro
      }
    };

    /**
     * Lida com a ação de salvar/remover um modelo dos favoritos.
     * Segue o mesmo padrão de atualização otimista da função handleLike.
     * @param {number} id - O ID do modelo a ser salvo.
     */
    const handleSave = async (id) => {
      if (!user) {
        toast.info("Você precisa estar logado para salvar um modelo.");
        return;
      }

      const originalModels = [...localModels];
      setLocalModels((prevModels) =>
        prevModels.map((model) =>
          model.id === id ? { ...model, isSaved: !model.isSaved } : model
        )
      );

      try {
        const token = localStorage.getItem("authToken");
        await axios.post(
          `http://127.0.0.1:8000/api/models3d/${id}/save/`,
          {},
          { headers: { Authorization: `Token ${token}` } }
        );
      } catch (error) {
        console.error("Erro ao salvar modelo:", error);
        toast.error("Ocorreu um erro ao salvar o modelo.");
        setLocalModels(originalModels); // Reverte a UI
      }
    };

    return (
      <div className="min-h-screen p-6 bg-slate-50 transition-all duration-300 overflow-x-hidden">
        <header className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
            Modelos 3D
          </h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">
            Explore, curta e salve seus modelos 3D favoritos!
          </p>
        </header>

        {isLoadingModels ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <ModelGrid
            models={localModels}
            onLike={handleLike}
            onSave={handleSave}
          />
        )}
      </div>
    );
  }
);

export default Home;
