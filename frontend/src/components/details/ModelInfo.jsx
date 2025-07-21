import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { Eye, Tag } from "lucide-react";

/**
 * Componente ModelInfo
 * Exibe o bloco principal de informações na página de detalhes de um modelo,
 * incluindo título, autor, descrição e estatísticas.
 * @param {{ model: object }} props - As propriedades do componente.
 * @param {object} props.model - O objeto completo do modelo 3D vindo da API.
 * @param {object} props.model.user - Objeto aninhado com os dados do autor.
 * @param {string} props.model.user.image - URL da imagem de perfil do autor.
 * @param {string} props.model.user.username - Nome de utilizador do autor.
 */
export const ModelInfo = ({ model }) => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-800 mb-2">{model.name}</h1>

      {/* Informações do criador */}
      <div className="flex items-center text-slate-600 mb-4 gap-3">
        <Avatar
          src={model.user?.image}
          alt={model.user?.username}
          sizeClasses="w-10 h-10"
        />
        <div>
          <span className="text-sm">Por:</span>
          <Link
            to={`/users/${model.user?.username}`}
            className="block font-medium text-blue-600 hover:underline"
          >
            {model.user?.username || "Desconhecido"}
          </Link>
        </div>
      </div>

      <p className="text-slate-700 mb-6">
        {model.description || "Sem descrição disponível."}
      </p>

      {/* Estatísticas do Modelo */}
      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 border-t border-b border-slate-200 py-4">
        <div className="flex items-center gap-2">
          <Eye size={16} />
          <span>{model.downloads || 0} Downloads</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag size={16} />
          <span>
            {model.is_free ? "Gratuito" : `${model.price || 0} moedas`}
          </span>
        </div>
      </div>
    </div>
  );
};
