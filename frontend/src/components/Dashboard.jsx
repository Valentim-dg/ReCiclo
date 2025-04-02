import React, { useState, useEffect } from "react";
import { FaRecycle, FaStar, FaTrophy } from "react-icons/fa";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import RecycleModal from "../components/RecycleModal";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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
  const [modalOpen, setModalOpen] = useState(false);

  const updateDashboard = React.useCallback(() => {
    if (user) {
      const token = localStorage.getItem("authToken");

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
          console.error("Erro ao atualizar o dashboard:", error)
        );
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      updateDashboard();
    }
  }, [user, updateDashboard]);

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
        label: "Reciclagem (g)",
        data: recyclingHistory,
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
        borderRadius: 5,
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
      x: {
        grid: { display: false },
      },
      y: {
        min: 50,
        max: 1000,
        ticks: { stepSize: 50 },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Dashboard
      </h2>

      <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg flex items-center w-full md:w-1/3">
          <FaRecycle className="text-4xl mr-4" />
          <div>
            <p className="text-lg">Moedas de Reciclagem</p>
            <h3 className="text-2xl font-semibold">{recyclingCoins}</h3>
          </div>
        </div>

        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg flex items-center w-full md:w-1/3">
          <FaStar className="text-4xl mr-4" />
          <div>
            <p className="text-lg">Moedas de Reputação</p>
            <h3 className="text-2xl font-semibold">{reputationCoins}</h3>
          </div>
        </div>

        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg flex items-center w-full md:w-1/3">
          <FaTrophy className="text-4xl mr-4" />
          <div>
            <p className="text-lg">Nível</p>
            <h3 className="text-2xl font-semibold">{level}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-2/3">
          <h3 className="text-lg font-semibold mb-3">Reciclagem Mensal</h3>
          <div className="h-64">
            <Bar data={recyclingData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/3">
          <h3 className="text-lg font-semibold mb-3">Conquistas</h3>
          <ul className="space-y-3">
            {achievements.length > 0 ? (
              achievements.map((achievement, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg"
                >
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
              <p className="text-gray-500 text-center">
                Nenhuma conquista desbloqueada ainda.
              </p>
            )}
          </ul>
        </div>
      </div>

      <RecycleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        updateDashboard={updateDashboard}
      />
    </div>
  );
};

export default Dashboard;
