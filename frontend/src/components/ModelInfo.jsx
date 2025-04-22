import React from "react";

const ModelInfo = ({ model }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      {/* Nome do modelo */}
      <h1 className="text-2xl font-bold mb-2">{model.name}</h1>

      {/* Informações do criador */}
      <div className="flex items-center mb-4">
        <img
          src={model.user?.image || "/default-avatar.png"}
          alt={`Avatar de ${model.user?.name || "Usuário"}`}
          className="w-10 h-10 rounded-full mr-3 object-cover"
        />
        <div>
          <p className="font-medium">{model.user?.name || "Usuário"}</p>
          <p className="text-sm text-gray-600">
            Publicado em {formatDate(model.created_at || new Date())}
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="flex gap-4 mb-6 text-sm text-gray-600">
        <div>
          <span className="font-medium">{model.likes || 0}</span> curtidas
        </div>
        <div>
          <span className="font-medium">{model.downloads || 0}</span> downloads
        </div>
      </div>

      {/* Descrição */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Descrição</h3>
        <p className="text-gray-700 whitespace-pre-line">{model.description}</p>
      </div>

      {/* Tags ou categorias, se houver */}
      {model.tags && model.tags.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {model.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 rounded-full px-3 py-1 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelInfo;
