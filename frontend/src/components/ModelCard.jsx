import React from "react";
import { Heart, Download, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "./ui/Avatar";

/**
 * Componente ModelCard
 * Exibe um "card" de pré-visualização para um único modelo 3D em um grid.
 * Mostra a imagem principal, nome, autor e ações como Curtir e Salvar.
 * @param {{
 * model: object,
 * onLike: (id: number) => void,
 * onSave: (id: number) => void
 * }} props - As propriedades do componente.
 * @param {object} props.model - O objeto do modelo 3D, já transformado para uso na UI.
 * @param {(id: number) => void} props.onLike - Função de callback para ser executada ao clicar no botão de Curtir.
 * @param {(id: number) => void} props.onSave - Função de callback para ser executada ao clicar no botão de Salvar.
 */
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

  const priceDisplay = isFree ? "Gratuito" : `${price || 0} moedas`;

  // Define as classes de estilo para o badge de preço
  const priceBadgeStyles = isFree
    ? "bg-green-100 text-green-800"
    : "bg-blue-100 text-blue-800";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl group">
      <Link to={`/models/${id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${priceBadgeStyles}`}
            >
              {priceDisplay}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center mb-2 gap-2">
          <Avatar src={userImage} alt={userName} sizeClasses="w-8 h-8" />
          <span className="text-sm text-gray-600 truncate">{userName}</span>
        </div>

        <Link to={`/models/${id}`} className="block">
          <h3 className="font-medium text-gray-800 truncate hover:text-blue-600 transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLike(id);
              }}
              className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Curtir"
            >
              <Heart
                size={18}
                className={isLiked ? "fill-red-500 text-red-500" : ""}
              />
              <span className="ml-1 text-xs font-medium">{likes}</span>
            </button>

            <div className="flex items-center text-gray-500" title="Downloads">
              <Download size={18} />
              <span className="ml-1 text-xs font-medium">{downloads}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave(id);
            }}
            className="text-gray-500 hover:text-indigo-600 transition-colors"
            aria-label="Salvar"
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
