// pages/ModelDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ModelImageGallery from "../components/ModelImageGallery";
import ModelInfo from "../components/ModelInfo";
import CommentSection from "../components/CommentSection";
import { ArrowLeft, Download, Heart, BookmarkPlus } from "lucide-react";

const ModelDetails = () => {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/api/models3d/${id}/`
        );
        setModel(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao buscar detalhes do modelo:", err);
        setError("Não foi possível carregar os detalhes do modelo");
        setLoading(false);
      }
    };

    if (id) {
      fetchModelDetails();
    }
  }, [id]);

  const handleLike = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/models3d/${id}/like/`);
      setModel((prevModel) => ({
        ...prevModel,
        likes: prevModel.is_liked ? prevModel.likes - 1 : prevModel.likes + 1,
        is_liked: !prevModel.is_liked,
      }));
    } catch (error) {
      console.error("Erro ao dar like:", error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/models3d/${id}/save/`);
      setModel((prevModel) => ({
        ...prevModel,
        is_saved: !prevModel.is_saved,
      }));
    } catch (error) {
      console.error("Erro ao salvar modelo:", error);
    }
  };

  const handleDownload = async () => {
    try {
      window.location.href = `http://127.0.0.1:8000/api/models3d/${id}/download/`;
    } catch (error) {
      console.error("Erro ao baixar modelo:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <Link to="/" className="text-blue-500 flex items-center">
          <ArrowLeft className="mr-2" size={16} />
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  if (!model) return null;

  return (
    <div className="min-h-screen bg-white-100 p-6">
      {/* Navegação */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-1" size={18} />
          <span>Voltar para Modelos</span>
        </Link>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Galeria de Imagens */}
        <div className="lg:col-span-2">
          <ModelImageGallery images={model.images} />
        </div>

        {/* Informações do Modelo */}
        <div className="lg:col-span-1">
          <ModelInfo model={model} />

          {/* Ações */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 py-2 px-4 rounded-md ${
                model.is_liked
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              } transition-all`}
            >
              <Heart
                size={18}
                className={model.is_liked ? "fill-red-600" : ""}
              />
              <span>{model.likes} Curtidas</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-2 py-2 px-4 rounded-md ${
                model.is_saved
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              } transition-all`}
            >
              <BookmarkPlus size={18} />
              <span>{model.is_saved ? "Salvo" : "Salvar"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 py-2 px-4 rounded-md bg-green-600 hover:bg-green-700 text-white transition-all"
            >
              <Download size={18} />
              <span>Baixar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Comentários */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Comentários</h2>
        <CommentSection modelId={id} />
      </div>
    </div>
  );
};

export default ModelDetails;
