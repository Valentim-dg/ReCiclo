import React from "react";
import ModelCard from "./ModelCard";

const ModelGrid = ({ models }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {models.length > 0 ? (
        models.map((model) => <ModelCard key={model.id} model={model} />)
      ) : (
        <p className="text-center text-gray-500 col-span-full">
          Nenhum modelo disponível.
        </p>
      )}
    </div>
  );
};

export default ModelGrid;
