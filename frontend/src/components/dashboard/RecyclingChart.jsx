import React from "react";
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

// Regista os módulos necessários do Chart.js para o gráfico de barras
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mapeamento de marcas de garrafas para cores, garantindo consistência visual no gráfico
const BRAND_COLORS = {
  "Coca-Cola": "rgba(220, 38, 38, 0.7)", // Vermelho
  Pepsi: "rgba(37, 99, 235, 0.7)", // Azul
  Sprite: "rgba(5, 150, 105, 0.7)", // Verde
  Fanta: "rgba(249, 115, 22, 0.7)", // Laranja
  Guaraná: "rgba(22, 163, 74, 0.7)", // Verde escuro
  Outro: "rgba(107, 114, 128, 0.7)", // Cinza
};

/**
 * Componente RecyclingChart
 * Renderiza um gráfico de barras empilhadas que visualiza o histórico de reciclagem mensal do utilizador.
 * @param {{ recyclingData: object }} props - As propriedades do componente.
 * @param {object} props.recyclingData - Objeto vindo da API contendo os dados para o gráfico.
 * @param {string[]} props.recyclingData.labels - Array com os nomes dos meses (ex: ["Jan", "Fev", ...]).
 * @param {object[]} props.recyclingData.datasets - Array de datasets, onde cada um representa um tipo de garrafa.
 */
const RecyclingChart = ({ recyclingData }) => {
  // Transforma os dados da API no formato que o Chart.js espera, adicionando cores
  const chartData = {
    labels: recyclingData.labels || [],
    datasets: (recyclingData.datasets || []).map((dataset) => ({
      ...dataset,
      data: dataset.filamentGrams, // O dado principal do gráfico é o filamento gerado
      backgroundColor: BRAND_COLORS[dataset.label] || BRAND_COLORS["Outro"],
      borderRadius: 5,
    })),
  };

  // Configurações de aparência e comportamento do gráfico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        // Callbacks para customizar o conteúdo do tooltip ao passar o mouse
        callbacks: {
          title: (context) => context[0].label, // Título do tooltip (ex: "Fevereiro")
          label: (context) => {
            // Corpo do tooltip (cada linha de cor)
            const dataset = context.dataset;
            const brand = dataset.label || "Desconhecido";
            const count = dataset.bottleCounts[context.dataIndex] || 0;
            const grams = dataset.filamentGrams[context.dataIndex] || 0;
            return ` ${brand}: ${count} garrafa(s) (${grams}g)`;
          },
          footer: (tooltipItems) => {
            // Rodapé do tooltip, mostrando os totais do mês
            if (!tooltipItems.length) return "";

            let totalBottles = 0;
            let totalGrams = 0;
            const dataIndex = tooltipItems[0].dataIndex;
            const chart = tooltipItems[0].chart;

            chart.data.datasets.forEach((dataset) => {
              totalBottles += dataset.bottleCounts[dataIndex] || 0;
              totalGrams += dataset.filamentGrams[dataIndex] || 0;
            });

            return `\nTotal do Mês: ${totalBottles} garrafas\nFilamento Total: ${totalGrams.toFixed(
              0
            )}g`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true, // Habilita o empilhamento das barras
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: "Filamento Gerado (g)",
        },
      },
    },
  };

  return <Bar data={chartData} options={chartOptions} />;
};

export default RecyclingChart;
