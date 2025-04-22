// components/ModelGrid.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Heart, BookmarkPlus } from "lucide-react";

const ModelGrid = ({ models, onLike, onSave }) => {
  if (!models || models.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Nenhum modelo encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {models.map((model) => (
        <div
          key={model.id}
          className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Link para a página de detalhes */}
          <Link to={`/models/${model.id}`} className="block">
            <div className="relative pb-[75%] bg-gray-100">
              <img
                src={model.image}
                alt={model.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 truncate">
                {model.name}
              </h3>
              <div className="flex items-center mb-3">
                <img
                  src={model.userImage}
                  alt={model.userName}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="text-sm text-gray-600">{model.userName}</span>
              </div>
            </div>
          </Link>

          {/* Área de interação (curtir/salvar) */}
          <div className="flex justify-between items-center px-4 pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLike(model.id);
                }}
                className="flex items-center gap-1 text-sm"
              >
                <Heart
                  size={16}
                  className={
                    model.isLiked
                      ? "fill-red-500 text-red-500"
                      : "text-gray-500"
                  }
                />
                <span>{model.likes}</span>
              </button>

              <span className="text-sm text-gray-500">
                {model.downloads} downloads
              </span>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave(model.id);
              }}
              className={`p-1 rounded-full ${
                model.isSaved ? "text-blue-500" : "text-gray-400"
              }`}
            >
              <BookmarkPlus size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModelGrid;
