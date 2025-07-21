import React from "react";

/**
 * Componente DashboardCard
 * Um card reutilizável para exibir métricas chave no dashboard, como moedas e nível.
 * @param {{
 * icon: React.ElementType,
 * title: string,
 * value: string | number,
 * colorClass: string
 * }} props - As propriedades do componente.
 * @param {React.ElementType} props.icon - O componente de ícone a ser exibido (ex: FaRecycle).
 * @param {string} props.title - O título do card (ex: "Moedas de Reciclagem").
 * @param {string | number} props.value - O valor principal a ser exibido.
 * @param {string} props.colorClass - A classe de cor de fundo do Tailwind CSS (ex: "bg-green-500").
 */
const DashboardCard = ({ icon: Icon, title, value, colorClass }) => (
  <div
    className={`p-6 rounded-xl shadow-lg flex items-center w-full md:w-1/3 text-white ${colorClass}`}
  >
    <Icon className="text-4xl mr-4 opacity-80" />
    <div>
      <p className="text-lg opacity-90">{title}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  </div>
);

export default DashboardCard;
