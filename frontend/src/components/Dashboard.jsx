import React, { useState, useEffect } from "react";
import { FaRecycle, FaStar, FaTrophy } from "react-icons/fa";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registra os componentes necessários para o gráfico
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ user }) => {
  const [recyclingCoins, setRecyclingCoins] = useState(0);
  const [reputationCoins, setReputationCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [recyclingHistory, setRecyclingHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("authToken");
      console.log("Token enviado:", token);

      axios
        .get("http://127.0.0.1:8000/api/user/dashboard/", {
          headers: { Authorization: `Token ${token}` },
        })
        .then((response) => {
          setRecyclingCoins(response.data.recyclingCoins);
          setReputationCoins(response.data.reputationCoins);
          setLevel(response.data.level);
          setRecyclingHistory(response.data.recyclingHistory || []);
          setAchievements(response.data.achievements || []);
        })
        .catch((error) =>
          console.error("Erro ao buscar dados do dashboard:", error)
        );
    }
  }, [user]);

  // Configuração do gráfico
  const recyclingData = {
    labels: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    datasets: [
      {
        label: "Garrafas Recicladas",
        data: recyclingHistory,
        backgroundColor: "rgba(34, 197, 94, 0.5)", // Verde
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      {/* Cards superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Moedas de Reciclagem */}
        <div className="bg-green-100 p-6 rounded-lg shadow flex items-center">
          <FaRecycle className="text-green-600 text-3xl mr-4" />
          <div>
            <p className="text-gray-700">Moedas de Reciclagem</p>
            <h3 className="text-xl font-semibold">{recyclingCoins}</h3>
          </div>
        </div>

        {/* Moedas de Reputação */}
        <div className="bg-blue-100 p-6 rounded-lg shadow flex items-center">
          <FaStar className="text-blue-600 text-3xl mr-4" />
          <div>
            <p className="text-gray-700">Moedas de Reputação</p>
            <h3 className="text-xl font-semibold">{reputationCoins}</h3>
          </div>
        </div>

        {/* Nível do Usuário */}
        <div className="bg-yellow-100 p-6 rounded-lg shadow flex items-center">
          <FaTrophy className="text-yellow-600 text-3xl mr-4" />
          <div>
            <p className="text-gray-700">Nível</p>
            <h3 className="text-xl font-semibold">{level}</h3>
          </div>
        </div>
      </div>

      {/* Gráfico de reciclagem mensal e conquistas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gráfico de reciclagem mensal */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Reciclagem Mensal</h3>
          <div className="h-64">
            <Bar data={recyclingData} options={chartOptions} />
          </div>
        </div>

        {/* Conquistas do Usuário */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Conquistas</h3>
          <ul className="space-y-3">
            {achievements.length > 0 ? (
              achievements.map((achievement, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <FaTrophy className="text-yellow-500 text-2xl" />
                  <div>
                    <p className="font-semibold">{achievement.title}</p>
                    <p className="text-gray-600 text-sm">
                      {achievement.description}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">
                Nenhuma conquista desbloqueada ainda.
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
