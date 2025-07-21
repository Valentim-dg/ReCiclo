import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Edit, Trash2 } from "lucide-react";
import EditModelModal from "./EditModelModal";

/**
 * Componente UserModelsGrid
 * Renderiza um grid com os modelos 3D criados pelo utilizador.
 * Oferece funcionalidades de edição (abrindo um modal) e de exclusão para cada modelo.
 * @param {{
 * models: object[],
 * onModelChange: () => void
 * }} props - As propriedades do componente.
 * @param {object[]} props.models - Array de objetos de modelo para exibir no grid.
 * @param {() => void} props.onModelChange - Função de callback a ser chamada após uma exclusão ou atualização bem-sucedida, para notificar o componente pai de que a lista de modelos precisa ser re-buscada.
 */
const UserModelsGrid = ({ models, onModelChange }) => {
  // Estado para controlar qual modelo está a ser editado, abrindo o modal correspondente.
  const [editingModel, setEditingModel] = useState(null);

  /**
   * Lida com a exclusão de um modelo, pedindo confirmação ao utilizador
   * antes de enviar a requisição para a API.
   * @param {number} modelId - O ID do modelo a ser apagado.
   */
  const handleDelete = async (modelId) => {
    if (
      window.confirm(
        "Tem a certeza de que deseja apagar este modelo? Esta ação não pode ser desfeita."
      )
    ) {
      const token = localStorage.getItem("authToken");
      try {
        await axios.delete(`http://127.0.0.1:8000/api/models3d/${modelId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        toast.success("Modelo apagado com sucesso!");
        onModelChange(); // Notifica o componente pai para atualizar a lista de modelos.
      } catch (error) {
        console.error("Erro ao apagar modelo:", error);
        toast.error("Não foi possível apagar o modelo. Tente novamente.");
      }
    }
  };

  /**
   * Função de callback chamada quando o modal de edição é fechado com sucesso.
   * Fecha o modal e atualiza a lista de modelos.
   */
  const handleUpdateSuccess = () => {
    setEditingModel(null);
    onModelChange();
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Meus Modelos</h2>
        {models.length === 0 ? (
          <p className="text-slate-500">Você ainda não enviou nenhum modelo.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className="border rounded-lg p-3 relative group"
              >
                <Link to={`/models/${model.id}`}>
                  <img
                    src={model.images[0]?.image || "/placeholder.png"}
                    alt={model.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <h3 className="font-semibold text-slate-700 truncate">
                    {model.name}
                  </h3>
                </Link>
                {/* Botões de Ação aparecem no hover */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingModel(model)}
                    title="Editar"
                    className="bg-white p-1.5 rounded-full shadow-md hover:bg-slate-100"
                  >
                    <Edit size={16} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    title="Apagar"
                    className="bg-white p-1.5 rounded-full shadow-md hover:bg-slate-100"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Renderiza o Modal de Edição quando um modelo é selecionado */}
      {editingModel && (
        <EditModelModal
          model={editingModel}
          onClose={() => setEditingModel(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
};

export default UserModelsGrid;
