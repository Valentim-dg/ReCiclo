import React from "react";
import ModelCard from "./ModelCard";

/**
 * Componente ModelGrid
 * Responsável por renderizar um grid de modelos 3D.
 * Recebe uma lista de modelos e mapeia cada um para um componente ModelCard,
 * passando as props necessárias para interação.
 * @param {{
 * models: object[],
 * onLike: (id: number) => void,
 * onSave: (id: number) => void
 * }} props - As propriedades do componente.
 * @param {object[]} props.models - Array de objetos de modelo a serem exibidos.
 * @param {(id: number) => void} props.onLike - Função de callback para lidar com a ação de curtir, passada para cada ModelCard.
 * @param {(id: number) => void} props.onSave - Função de callback para lidar com a ação de salvar, passada para cada ModelCard.
 */
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
          // Passa os dados do modelo, garantindo valores padrão para campos opcionais.
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
