import React, { useState, useMemo } from "react";
import AchievementItem from "./AchievementItem";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

/**
 * Componente AchievementsList
 * Responsável por renderizar a secção de conquistas no dashboard.
 * Recebe uma lista completa de conquistas e gere a sua exibição,
 * mostrando uma vista resumida por defeito e uma vista completa ao clicar em "Mostrar Todas".
 * @param {{ achievements: object[] }} props - As propriedades do componente.
 * @param {object[]} props.achievements - Array de objetos de conquistas vindos da API.
 */
const AchievementsList = ({ achievements }) => {
  const [showAll, setShowAll] = useState(false);

  const unlockedAchievements = useMemo(
    () => achievements.filter((a) => a.unlocked),
    [achievements]
  );

  const lockedAchievements = useMemo(
    () => achievements.filter((a) => !a.unlocked),
    [achievements]
  );

  // Determina quais conquistas são exibidas: todas, ou um resumo das principais.
  const displayedAchievements = useMemo(() => {
    if (showAll) {
      return achievements;
    }
    // Por defeito, mostra as 3 primeiras desbloqueadas e a próxima a ser desbloqueada.
    return [
      ...unlockedAchievements.slice(0, 3),
      ...lockedAchievements.slice(0, 1),
    ];
  }, [showAll, achievements, unlockedAchievements, lockedAchievements]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-1/3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Conquistas
          <span className="ml-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {unlockedAchievements.length}/{achievements.length}
          </span>
        </h3>
        {achievements.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            {showAll ? "Mostrar Menos" : "Mostrar Todas"}
            {showAll ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto pr-2">
        <ul className="space-y-3">
          {displayedAchievements.length > 0 ? (
            displayedAchievements.map((achievement) => (
              <AchievementItem key={achievement.id} achievement={achievement} />
            ))
          ) : (
            <p className="text-slate-500 text-center py-8">
              Nenhuma conquista disponível.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AchievementsList;
