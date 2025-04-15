import React, { useState } from "react";
import axios from "axios";
import { FaTrophy, FaArrowUp } from "react-icons/fa";

const brands = ["Coca-Cola", "Fanta", "Pepsi", "Sprite", "Guaraná", "Outro"];
const volumes = ["350ml", "500ml", "1L", "1.5L", "2L", "3L", "Outro"];

const RecycleModal = ({ isOpen, onClose, updateDashboard }) => {
  const [bottleType, setBottleType] = useState("");
  const [customBottleType, setCustomBottleType] = useState("");
  const [volume, setVolume] = useState("");
  const [customVolume, setCustomVolume] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showNewAchievements, setShowNewAchievements] = useState(false);
  const [levelUp, setLevelUp] = useState(null);

  const resetForm = () => {
    setBottleType("");
    setCustomBottleType("");
    setVolume("");
    setCustomVolume("");
    setQuantity(1);
    setMessage({ text: "", type: "" });
    setIsSubmitting(false);
    setNewAchievements([]);
    setShowNewAchievements(false);
    setLevelUp(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage({
        text: "Você precisa estar logado para reciclar.",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Enviando dados para a API..."); // Log para verificar o início da requisição
      const response = await axios.post(
        "http://127.0.0.1:8000/api/recycle/bottles/",
        {
          type: bottleType === "Outro" ? customBottleType : bottleType,
          volume: volume === "Outro" ? customVolume : volume,
          quantity: Number(quantity),
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      console.log("Resposta da API:", response.data); // Log para verificar a resposta da API

      setMessage({
        text: "Reciclagem registrada com sucesso!",
        type: "success",
      });

      if (typeof updateDashboard === "function") {
        updateDashboard(); // Atualiza o dashboard logo após o POST
      }

      // Verificar se o usuário subiu de nível
      const userData = JSON.parse(localStorage.getItem("user")) || {};
      const oldLevel = userData.level || 1;
      const newLevel = response.data.level;

      console.log("Nível antigo:", oldLevel, "Novo nível:", newLevel); // Log para verificar os níveis

      if (newLevel > oldLevel) {
        setLevelUp(newLevel);

        // Atualizar o nível no localStorage
        userData.level = newLevel;
        localStorage.setItem("user", JSON.stringify(userData));
      }

      // Verifica se há novas conquistas
      if (
        response.data.new_achievements &&
        response.data.new_achievements.length > 0
      ) {
        console.log(
          "Novas conquistas recebidas:",
          response.data.new_achievements
        ); // Log para verificar as conquistas recebidas
        setNewAchievements(response.data.new_achievements);
        setShowNewAchievements(true);
      } else {
        console.log("Nenhuma nova conquista desbloqueada."); // Log para verificar quando não há conquistas
        // Se não há novas conquistas, aguarda e fecha
        setTimeout(() => {
          if (typeof updateDashboard === "function") {
            updateDashboard(); // Atualiza o dashboard após o POST
          }
          resetForm();
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao registrar reciclagem:", error); // Log para verificar erros
      setMessage({
        text:
          error.response?.data?.message || "Erro ao registrar a reciclagem.",
        type: "error",
      });
      setIsSubmitting(false);
    }
  };

  const handleCloseAchievements = () => {
    setShowNewAchievements(false);
    // Atualiza o dashboard após fechar o modal de conquistas
    if (typeof updateDashboard === "function") {
      updateDashboard();
    }
    setTimeout(() => {
      resetForm();
      onClose();
    }, 500);
  };

  if (!isOpen) return null;

  // Modal de novas conquistas
  if (showNewAchievements) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={handleCloseAchievements}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4 text-center">
            Novas Conquistas Desbloqueadas!
          </h2>

          <ul className="space-y-3 my-4">
            {newAchievements.map((achievement, index) => (
              <li
                key={index}
                className="bg-green-50 p-4 rounded-lg flex items-start"
              >
                <div className="text-yellow-500 mr-3 mt-1">
                  <FaTrophy size={24} />
                </div>
                <div>
                  <p className="font-bold text-green-700">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +10 moedas de reputação
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            onClick={handleCloseAchievements}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // Modal principal de reciclagem
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
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
          disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              required
            />
          )}

          <label className="block mb-2">
            Volume:
            <select
              className="w-full p-2 border rounded"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              required
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              required
            />
          )}

          <label className="block mb-2">
            Quantidade:
            <input
              type="number"
              className="w-full p-2 border rounded mt-2"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              required
              disabled={isSubmitting}
            />
          </label>

          <button
            type="submit"
            className={`w-full px-4 py-2 text-white rounded mt-4 transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processando...
              </span>
            ) : (
              "Reciclar"
            )}
          </button>
        </form>
      </div>

      {/* Notificação de Level Up (renderizada condicionalmente) */}
      {levelUp && (
        <LevelUpNotification
          newLevel={levelUp}
          onClose={() => setLevelUp(null)}
        />
      )}
    </div>
  );
};

const LevelUpNotification = ({ newLevel, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    // Fechar automaticamente após 5 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 bg-yellow-400 text-yellow-900 p-4 rounded-lg shadow-lg
                 flex items-center animate-bounce z-50 max-w-xs"
    >
      <div className="bg-yellow-300 rounded-full p-3 mr-3">
        <FaArrowUp className="text-yellow-600 text-xl" />
      </div>
      <div>
        <h3 className="font-bold text-lg">Nível Aumentado!</h3>
        <p>Parabéns! Você alcançou o nível {newLevel}.</p>
      </div>
    </div>
  );
};

export default RecycleModal;
