import React, { useState } from "react";
import { Loader2 } from "lucide-react";

// Constantes para as opções dos campos de seleção, facilitando a manutenção.
const brands = ["Coca-Cola", "Fanta", "Pepsi", "Sprite", "Guaraná", "Outro"];
const volumes = ["350ml", "500ml", "1L", "1.5L", "2L", "3L", "Outro"];

/**
 * Componente RecycleForm
 * Renderiza o formulário para o utilizador registar as garrafas recicladas.
 * Gere o seu próprio estado interno e notifica o componente pai na submissão.
 * @param {{
 * onSubmit: (formData: object) => void,
 * isSubmitting: boolean
 * }} props - As propriedades do componente.
 * @param {(formData: object) => void} props.onSubmit - Função de callback a ser executada quando o formulário é submetido.
 * @param {boolean} props.isSubmitting - Indica se uma ação de submissão está em andamento para desativar os campos.
 */
const RecycleForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    bottleType: "",
    customBottleType: "",
    volume: "",
    customVolume: "",
    quantity: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="bottleType"
          className="block text-sm font-medium text-slate-700"
        >
          Tipo (Marca)
        </label>
        <select
          id="bottleType"
          name="bottleType"
          value={formData.bottleType}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Selecione</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
        {formData.bottleType === "Outro" && (
          <input
            type="text"
            name="customBottleType"
            value={formData.customBottleType}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Digite a marca"
          />
        )}
      </div>

      <div>
        <label
          htmlFor="volume"
          className="block text-sm font-medium text-slate-700"
        >
          Volume
        </label>
        <select
          id="volume"
          name="volume"
          value={formData.volume}
          onChange={handleChange}
          required
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="">Selecione</option>
          {volumes.map((vol) => (
            <option key={vol} value={vol}>
              {vol}
            </option>
          ))}
        </select>
        {formData.volume === "Outro" && (
          <input
            type="text"
            name="customVolume"
            value={formData.customVolume}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Digite o volume"
          />
        )}
      </div>

      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-slate-700"
        >
          Quantidade
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          required
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin mr-2" /> Processando...
          </>
        ) : (
          "Reciclar"
        )}
      </button>
    </form>
  );
};

export default RecycleForm;
