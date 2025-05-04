import React from "react";
import ModelCard from "./ModelCard";

const ModelGrid = ({ models, onLike, onSave }) => {
  if (!models || models.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Nenhum modelo encontrado.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={{
            ...model,
            isFree:
              model.isFree !== undefined ? model.isFree : model.price === 0,
            price: model.price || 0,
          }}
          onLike={onLike}
          onSave={onSave}
        />
      ))}
    </div>
  );
};

export default ModelGrid;
