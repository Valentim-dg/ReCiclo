import React from "react";
import { FaTrophy } from "react-icons/fa";

/**
 * Componente LevelProgressCard
 * Um card especializado para exibir o nível atual do utilizador e uma barra
 * de progresso visual para o próximo nível.
 * @param {{
 * level: number,
 * currentXp: number,
 * nextLevelXp: number
 * }} props - As propriedades do componente.
 * @param {number} props.level - O nível atual do utilizador.
 * @param {number} props.currentXp - A quantidade de experiência atual do utilizador.
 * @param {number} props.nextLevelXp - A quantidade de experiência necessária para o próximo nível.
 */
const LevelProgressCard = ({ level, currentXp, nextLevelXp }) => {
  // Calcula a percentagem do progresso, garantindo que não ultrapasse 100%
  const progressPercentage =
    nextLevelXp > 0 ? Math.min((currentXp / nextLevelXp) * 100, 100) : 0;

  return (
    <div className="bg-yellow-500 text-white p-6 rounded-xl shadow-lg w-full md:w-1/3 flex flex-col justify-between">
      {/* Secção do Nível */}
      <div className="flex items-center mb-4">
        <FaTrophy className="text-4xl mr-4 opacity-80" />
        <div>
          <p className="text-lg opacity-90">Nível</p>
          <h3 className="text-3xl font-bold">{level}</h3>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div>
        <div className="flex justify-between text-xs font-medium mb-1">
          <span>Progresso</span>
          <span>
            {currentXp} / {nextLevelXp} XP
          </span>
        </div>
        <div className="w-full bg-yellow-400/50 rounded-full h-2.5">
          <div
            className="bg-white h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgressCard;
