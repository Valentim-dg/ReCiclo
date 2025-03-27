import React, { useState } from "react";
import { Link } from "react-router-dom";
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

  const token = localStorage.getItem("authToken");
  const headers = token ? { Authorization: `Token ${token}` } : {};

  const handleLike = async () => {
    if (!token) {
      alert("Você precisa estar logado para curtir.");
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/models3d/${model.id}/like/`,
        {},
        { headers }
      );

      setLikes(response.data.likes);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Erro ao curtir:", error);
      alert("Erro ao curtir. Verifique se está logado.");
    }
  };

  const handleSave = async () => {
    if (!token) {
      alert("Você precisa estar logado para favoritar.");
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/models3d/${model.id}/save/`,
        {},
        { headers }
      );

      setIsSaved(response.data.saved);
    } catch (error) {
      console.error("Erro ao favoritar:", error);
      alert("Erro ao favoritar. Verifique se está logado.");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/models3d/${model.id}/download/`,
        { responseType: "blob", headers }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = model.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloads(downloads + 1);
    } catch (error) {
      console.error("Erro ao registrar download:", error);
      alert("Erro ao baixar o modelo.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 p-4 flex flex-col">
      {/* Link para a página de detalhes do modelo */}
      <Link to={`/models/${model.id}`} className="block">
        {/* User Info */}
        <div className="flex items-center mb-4">
          <img
            src={model.userImage || "/default-avatar.png"}
            alt={model.userName}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div className="truncate">
            <h4 className="font-semibold text-gray-800">{model.userName}</h4>
            <p className="text-sm text-gray-500 truncate">{model.userHandle}</p>
          </div>
        </div>

        {/* Model Image */}
        {model.image && (
          <img
            src={model.image}
            alt={model.name}
            className="w-full h-48 md:h-56 lg:h-64 object-cover rounded-lg mb-4 transition-transform duration-200 hover:scale-105"
          />
        )}
      </Link>

      {/* Actions */}
      <div className="flex justify-between items-center mt-auto">
        <button
          onClick={handleLike}
          className={`flex items-center ${
            isLiked ? "text-red-500" : "text-gray-400"
          } hover:text-red-600`}
        >
          {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
          <span className="ml-2 text-sm">{likes}</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          <FaDownload size={18} />
          <span className="ml-2 text-sm">{downloads}</span>
        </button>

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
