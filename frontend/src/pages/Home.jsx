import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";
import ModelGrid from "../components/ModelGrid";

const Home = forwardRef(
  ({ user, models: initialModels, setModels, fetchModels }, ref) => {
    const [models, setLocalModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Expõe o método updateModels para o componente pai
    useImperativeHandle(ref, () => ({
      updateModels: (newModels) => {
        const transformedData = newModels.map((model) => ({
          id: model.id,
          userName: model.user?.handle || "Usuário",
          userHandle: model.user?.handle || "usuario",
          userImage: model.user?.image || "/default-avatar.png",
          name: model.name,
          image:
            model.images.length > 0
              ? model.images[0].image
              : "/placeholder.png",
          likes: model.likes || 0,
          downloads: model.downloads || 0,
          isLiked: model.is_liked,
          isSaved: model.is_saved,
        }));

        setLocalModels(transformedData);
        setIsLoading(false);
      },
    }));

    // Esta função transforma os dados do modelo para o formato necessário
    const transformModelsData = (modelsData) => {
      return modelsData.map((model) => ({
        id: model.id,
        userName: model.user?.handle || "Usuário",
        userHandle: model.user?.handle || "usuario",
        userImage: model.user?.image || "/default-avatar.png",
        name: model.name,
        image:
          model.images.length > 0 ? model.images[0].image : "/placeholder.png",
        likes: model.likes || 0,
        downloads: model.downloads || 0,
        isLiked: model.is_liked,
        isSaved: model.is_saved,
      }));
    };

    useEffect(() => {
      // Carregar modelos apenas uma vez ao montar o componente
      const loadModels = async () => {
        setIsLoading(true);
        try {
          // Verifica se já temos modelos iniciais
          if (initialModels && initialModels.length > 0) {
            setLocalModels(transformModelsData(initialModels));
          } else {
            // Caso contrário, busca do servidor
            const fetchedModels = await fetchModels();
            setLocalModels(transformModelsData(fetchedModels));
          }
        } catch (error) {
          console.error("Erro ao buscar modelos 3D:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadModels();
      // A dependência é apenas o array initialModels, não a função fetchModels
    }, [initialModels]);

    const handleLike = async (id) => {
      try {
        await axios.post(`http://127.0.0.1:8000/api/models3d/${id}/like/`);
        setLocalModels((prevModels) =>
          prevModels.map((model) =>
            model.id === id
              ? {
                  ...model,
                  likes: model.isLiked ? model.likes - 1 : model.likes + 1,
                  isLiked: !model.isLiked,
                }
              : model
          )
        );
      } catch (error) {
        console.error("Erro ao dar like:", error);
      }
    };

    const handleSave = async (id) => {
      try {
        await axios.post(`http://127.0.0.1:8000/api/models3d/${id}/save/`);
        setLocalModels((prevModels) =>
          prevModels.map((model) =>
            model.id === id ? { ...model, isSaved: !model.isSaved } : model
          )
        );
      } catch (error) {
        console.error("Erro ao salvar modelo:", error);
      }
    };

    return (
      <div className="min-h-screen p-6 bg-white-100 transition-all duration-300 overflow-x-hidden">
        <header className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
            Modelos 3D
          </h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">
            Explore, curta e salve seus modelos 3D favoritos!
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <ModelGrid models={models} onLike={handleLike} onSave={handleSave} />
        )}
      </div>
    );
  }
);

export default Home;
