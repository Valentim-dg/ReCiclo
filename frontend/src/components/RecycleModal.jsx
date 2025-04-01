import React, { useState } from "react";
import axios from "axios";

const brands = ["Coca-Cola", "Fanta", "Pepsi", "Sprite", "Guaraná", "Outro"];
const volumes = ["350ml", "500ml", "1L", "1.5L", "2L", "3L", "Outro"];

const RecycleModal = ({ isOpen, onClose }) => {
  const [bottleType, setBottleType] = useState("");
  const [customBottleType, setCustomBottleType] = useState("");
  const [volume, setVolume] = useState("");
  const [customVolume, setCustomVolume] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!token) {
      setMessage({
        text: "Você precisa estar logado para reciclar.",
        type: "error",
      });
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/recycle/",
        {
          type: bottleType === "Outro" ? customBottleType : bottleType,
          volume: volume === "Outro" ? customVolume : volume,
          quantity,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      setMessage({
        text: "Reciclagem registrada com sucesso!",
        type: "success",
      });
      setTimeout(onClose, 2000);
    } catch (error) {
      setMessage({ text: "Erro ao registrar a reciclagem.", type: "error" });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-4">Reciclar Garrafas</h2>

        {/* Mensagem de Feedback */}
        {message.text && (
          <p
            className={`p-2 rounded text-center mb-2 ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Tipo (Marca):
            <select
              className="w-full p-2 border rounded"
              value={bottleType}
              onChange={(e) => setBottleType(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
          {bottleType === "Outro" && (
            <input
              type="text"
              className="w-full p-2 border rounded mt-2"
              placeholder="Digite a marca"
              value={customBottleType}
              onChange={(e) => setCustomBottleType(e.target.value)}
            />
          )}

          <label className="block mb-2">
            Volume:
            <select
              className="w-full p-2 border rounded"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {volumes.map((vol) => (
                <option key={vol} value={vol}>
                  {vol}
                </option>
              ))}
            </select>
          </label>
          {volume === "Outro" && (
            <input
              type="text"
              className="w-full p-2 border rounded mt-2"
              placeholder="Digite o volume"
              value={customVolume}
              onChange={(e) => setCustomVolume(e.target.value)}
            />
          )}

          <label className="block mb-2">
            Quantidade:
            <input
              type="number"
              className="w-full p-2 border rounded mt-2"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded mt-4 hover:bg-green-600 transition"
          >
            Reciclar
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecycleModal;
