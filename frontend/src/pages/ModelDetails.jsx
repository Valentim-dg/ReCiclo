import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ImageCarousel from "../components/ImageCarousel";

const ModelDetails = ({}) => {
  const { id } = useParams();
  const [model, setModel] = useState(null);

  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/models3d/${id}/`
        );
        setModel(response.data);
      } catch (error) {
        console.error("Erro ao buscar detalhes do modelo:", error);
      }
    };

    fetchModelDetails();
  }, [id]);

  if (!model) {
    return <div className="text-center py-10">Carregando...</div>;
  }

  return (
    <div
      className={`p-6 bg-white transition-all duration-300 overflow-hidden min-h-screen
      `}
    >
      {/* Container principal */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        {/* Imagens do Modelo */}
        <div className="w-full md:w-3/5">
          <ImageCarousel image={model.image} />
        </div>

        {/* Informações do Criador */}
        <div className="w-full md:w-2/5 flex flex-col items-center text-center">
          <img
            src={model.user.image || "/default-avatar.png"}
            alt={model.user.handle}
            className="w-16 h-16 rounded-full shadow-md"
          />
          <h2 className="mt-3 text-xl font-semibold">{model.user.handle}</h2>
        </div>
      </div>
    </div>
  );
};

export default ModelDetails;
