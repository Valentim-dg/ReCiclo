import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FaRecycle, FaStar, FaTrophy } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// Importa os sub-componentes do dashboard
import DashboardCard from "../components/dashboard/DashboardCard";
import AchievementsList from "../components/dashboard/AchievementsList";
import RecyclingChart from "../components/dashboard/RecyclingChart";
import LevelProgressCard from "../components/dashboard/LevelProgressCard";

/**
 * Componente Dashboard
 * A página principal do painel do utilizador, que exibe um resumo do seu progresso,
 * estatísticas de reciclagem, e conquistas.
 * @param {{ user: object | null }} props - As propriedades do componente.
 * @param {object | null} props.user - O objeto do utilizador autenticado, vindo do AuthContext.
 */
const Dashboard = ({ user }) => {
  // Estado para armazenar todos os dados recebidos da API do dashboard
  const [dashboardData, setDashboardData] = useState({
    recyclingCoins: 0,
    reputationCoins: 0,
    level: 1,
    experience: 0,
    experience_for_next_level: 100,
    recyclingData: { labels: [], datasets: [] },
    achievements: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Busca os dados do dashboard a partir da API.
   * A função é memorizada com useCallback para otimizar o desempenho.
   */
  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/user/dashboard/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Efeito para buscar os dados quando o componente monta ou o utilizador muda.
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Exibe um ecrã de carregamento enquanto os dados são buscados.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-16 w-16 text-blue-500" />
      </div>
    );
  }

  // Exibe uma mensagem se o utilizador não estiver logado.
  if (!user) {
    return (
      <div className="text-center p-10">
        Você precisa estar logado para ver o dashboard.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Meu Desempenho
      </h2>

      {/* Cards de Resumo */}
      <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
        <DashboardCard
          icon={FaRecycle}
          title="Moedas de Reciclagem"
          value={dashboardData.recyclingCoins}
          colorClass="bg-green-500"
        />
        <DashboardCard
          icon={FaStar}
          title="Moedas de Reputação"
          value={dashboardData.reputationCoins}
          colorClass="bg-blue-500"
        />
        <LevelProgressCard
          level={dashboardData.level}
          currentXp={dashboardData.experience}
          nextLevelXp={dashboardData.experience_for_next_level}
        />
      </div>

      {/* Gráfico e Conquistas */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full lg:w-2/3">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">
            Reciclagem Mensal
          </h3>
          <div className="h-96">
            <RecyclingChart recyclingData={dashboardData.recyclingData} />
          </div>
        </div>

        <AchievementsList achievements={dashboardData.achievements} />
      </div>
    </div>
  );
};

export default Dashboard;
