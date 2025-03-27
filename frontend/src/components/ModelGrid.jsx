import React from "react";
import ModelCard from "./ModelCard";

const ModelGrid = ({ models }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {models.map((model) => {
        console.log("Modelo recebido no ModelGrid:", model);
        return <ModelCard key={model.id} model={model} />;
      })}
    </div>
  );
};

export default ModelGrid;
