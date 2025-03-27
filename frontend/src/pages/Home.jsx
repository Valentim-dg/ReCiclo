import React, { useEffect, useState } from "react";
import axios from "axios";
import ModelGrid from "../components/ModelGrid";

const Home = ({}) => {
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/models3d/");
        console.log("Resposta da API:", response.data);

        const transformedData = response.data.map((model) => ({
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

        console.log("Dados transformados:", transformedData);

        setModels(transformedData);
      } catch (error) {
        console.error("Erro ao buscar modelos 3D:", error);
      }
    };
    fetchModels();
  }, []);

  const handleLike = async (id) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/models3d/${id}/like/`);
      setModels((prevModels) =>
        prevModels.map((model) =>
          model.id === id
            ? { ...model, likes: model.likes + 1, isLiked: !model.isLiked }
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
      setModels((prevModels) =>
        prevModels.map((model) =>
          model.id === id ? { ...model, isSaved: !model.isSaved } : model
        )
      );
    } catch (error) {
      console.error("Erro ao salvar modelo:", error);
    }
  };

  return (
    <div
      className={`min-h-screen p-6 bg-white-100 transition-all duration-300 overflow-x-hidden `}
    >
      <header className="mb-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
          Modelos 3D
        </h1>
        <p className="text-gray-600 mt-2 text-sm lg:text-base">
          Explore, curta e salve seus modelos 3D favoritos!
        </p>
      </header>

      {/* Grade de Modelos 3D */}
      <ModelGrid models={models} onLike={handleLike} onSave={handleSave} />
    </div>
  );
};

export default Home;
