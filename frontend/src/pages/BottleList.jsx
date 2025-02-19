import React, { useState, useEffect } from "react";
import api from "../services/api";

function BottleList() {
  const [bottles, setBottles] = useState([]);

  useEffect(() => {
    api
      .get("/bottles/")
      .then((response) => setBottles(response.data))
      .catch((error) => console.error("Erro ao buscar garrafas:", error));
  }, []);

  return (
    <div>
      <h1>Garrafas Recicladas</h1>
      <ul>
        {bottles.map((bottle) => (
          <li key={bottle.id}>
            Tipo: {bottle.type} - Quantidade: {bottle.quantity} - Data:{" "}
            {new Date(bottle.date).toLocaleDateString()} - Usuario:{" "}
            {bottle.user}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BottleList;
