import React, { useState, useEffect } from "react";
import { ArrowUp, Award } from "lucide-react";

const LevelUpNotification = ({ newLevel, onClose }) => {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 p-4 text-white shadow-lg">
      <div className="flex-shrink-0 rounded-full bg-white/30 p-3">
        <Award size={32} className="text-white" />
      </div>
      <div>
        <h3 className="font-bold text-lg">LEVEL UP!</h3>
        <p className="text-sm">Parabéns! Você alcançou o nível {newLevel}.</p>
      </div>
    </div>
  );
};

export default LevelUpNotification;
