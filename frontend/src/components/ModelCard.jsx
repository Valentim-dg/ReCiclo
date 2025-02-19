import React, { useState } from "react";
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaDownload,
} from "react-icons/fa";
import axios from "axios";

const ModelCard = ({ model }) => {
  const [likes, setLikes] = useState(model.likes);
  const [downloads, setDownloads] = useState(model.downloads);
  const [isLiked, setIsLiked] = useState(model.isLiked);
  const [isSaved, setIsSaved] = useState(model.isSaved);

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/models3d/${model.id}/like/`
      );
      setLikes((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1)); // Evita re-renders desnecessários
      setIsLiked(response.data.is_liked);
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/models3d/${model.id}/save/`
      );
      setIsSaved(response.data.is_saved);
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/models3d/${model.id}/download/`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${model.name}.stl`; // Define um nome adequado para o download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloads((prev) => prev + 1);
    } catch (error) {
      console.error("Erro ao registrar download:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 p-4 flex flex-col">
      {/* User Info */}
      <div className="flex items-center mb-4">
        <img
          src={model.userImage || "/default-avatar.png"}
          alt={model.userName}
          className="w-10 h-10 rounded-full mr-3 object-cover"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }} // Se falhar, usa um avatar padrão
        />
        <div className="truncate">
          <h4 className="font-semibold text-gray-800">{model.userName}</h4>
          <p className="text-sm text-gray-500 truncate">{model.userHandle}</p>
        </div>
      </div>

      {/* Model Image */}
      <div className="relative">
        {model.image ? (
          <img
            src={model.image}
            alt={model.name}
            className="w-full h-48 md:h-56 lg:h-64 object-cover rounded-lg transition-transform duration-200 hover:scale-105"
            onError={(e) => {
              e.target.src = "/default-model.png";
            }} // Se falhar, usa uma imagem padrão
          />
        ) : (
          <div className="w-full h-48 md:h-56 lg:h-64 bg-gray-200 flex items-center justify-center rounded-lg">
            <p className="text-gray-500">Sem imagem</p>
          </div>
        )}
      </div>

      {/* Model Name */}
      <h3 className="text-lg font-bold text-gray-700 text-center mt-3">
        {model.name}
      </h3>

      {/* Actions */}
      <div className="flex justify-between items-center mt-4">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center ${
            isLiked ? "text-red-500" : "text-gray-400"
          } hover:text-red-600`}
        >
          {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
          <span className="ml-2 text-sm">{likes}</span>
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          <FaDownload size={18} />
          <span className="ml-2 text-sm">{downloads}</span>
        </button>

        {/* Favorito */}
        <button
          onClick={handleSave}
          className={`flex items-center ${
            isSaved ? "text-yellow-500" : "text-gray-400"
          } hover:text-yellow-600`}
        >
          {isSaved ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />}
        </button>
      </div>
    </div>
  );
};

export default ModelCard;
