import React from "react";
import { Heart, Download, BookmarkPlus, BookmarkCheck } from "lucide-react";

const ModelCard = ({ model, onLike, onSave }) => {
  const {
    id,
    name,
    image,
    userName,
    userImage,
    likes,
    downloads,
    isLiked,
    isSaved,
    price,
    isFree,
  } = model;

  // Determine the price display text based on what data we have
  const isPriceDisplayFree = isFree === true;
  const priceDisplay = isPriceDisplayFree ? "Gratuito" : `${price || 0} moedas`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Imagem do modelo */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />

        {/* Badge de preço */}
        <div className="absolute top-2 right-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              isPriceDisplayFree
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {priceDisplay}
          </span>
        </div>
      </div>

      {/* Informações do modelo */}
      <div className="p-4">
        <div className="flex items-center mb-2">
          <img
            src={userImage}
            alt={userName}
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm text-gray-600">{userName}</span>
        </div>

        <h3 className="font-medium text-gray-800 truncate">{name}</h3>

        {/* Botões de ação */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onLike(id)}
              className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart
                size={18}
                className={isLiked ? "fill-red-500 text-red-500" : ""}
              />
              <span className="ml-1 text-xs">{likes}</span>
            </button>

            <div className="flex items-center text-gray-500">
              <Download size={18} />
              <span className="ml-1 text-xs">{downloads}</span>
            </div>
          </div>

          <button
            onClick={() => onSave(id)}
            className="text-gray-500 hover:text-indigo-600 transition-colors"
          >
            {isSaved ? (
              <BookmarkCheck
                size={18}
                className="fill-indigo-200 text-indigo-600"
              />
            ) : (
              <BookmarkPlus size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
