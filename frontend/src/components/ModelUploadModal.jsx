import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { X, Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";

/**
 * Componente ModelUploadModal
 * Renderiza um modal com um formulário completo para o utilizador fazer o upload
 * de um novo modelo 3D, incluindo detalhes, ficheiros de modelo e imagens.
 * @param {{
 * closeModal: () => void,
 * onUploadSuccess: () => void
 * }} props - As propriedades do componente.
 * @param {() => void} props.closeModal - Função para fechar o modal.
 * @param {() => void} props.onUploadSuccess - Função de callback para notificar o componente pai que um upload foi bem-sucedido, para que a lista de modelos possa ser atualizada.
 */
const ModelUploadModal = ({ closeModal, onUploadSuccess }) => {
  const { user } = useAuth();

  // Estados para controlar os campos do formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);

  // Estados para controlar a UI do modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFilesChange = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const handleImagesChange = (e) => {
    setImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setPrice(value < 0 ? 0 : value);
  };

  /**
   * Lida com a submissão do formulário.
   * Valida os dados, monta o FormData e envia para a API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!user) {
      setError("Você precisa estar logado para enviar um modelo.");
      return;
    }

    if (!name || !description || files.length === 0 || images.length === 0) {
      setError(
        "Preencha todos os campos e envie pelo menos um ficheiro e uma imagem."
      );
      return;
    }

    if (!isFree && price <= 0) {
      setError("Para modelos pagos, o preço deve ser maior que zero.");
      return;
    }

    setIsSubmitting(true);

    // FormData é necessário para enviar ficheiros para a API.
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("is_free", isFree);
    formData.append("price", isFree ? 0 : price);
    files.forEach((file) => formData.append("file", file));
    images.forEach((image) => formData.append("image", image));

    const token = localStorage.getItem("authToken");

    try {
      await axios.post("http://127.0.0.1:8000/api/models3d/upload/", formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      toast.success("Modelo enviado com sucesso!");

      if (typeof onUploadSuccess === "function") {
        onUploadSuccess();
      }

      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      console.error("Erro ao enviar modelo:", err.response?.data);
      const errorMessage =
        err.response?.data?.error ||
        "Erro ao enviar modelo. Verifique os ficheiros e tente novamente.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold">Adicionar Modelo 3D</h2>
          <button onClick={closeModal} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mt-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mt-4 text-sm flex items-center gap-2">
            <CheckCircle size={18} /> Modelo enviado com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Nome do Modelo
            </label>
            <input
              type="text"
              className="mt-1 p-2 border rounded w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting || success}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              className="mt-1 p-2 border rounded w-full"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isSubmitting || success}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precificação
            </label>
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="free"
                name="pricing"
                checked={isFree}
                onChange={() => setIsFree(true)}
                disabled={isSubmitting || success}
                className="mr-2"
              />
              <label htmlFor="free" className="text-sm text-gray-700">
                Gratuito
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="paid"
                name="pricing"
                checked={!isFree}
                onChange={() => setIsFree(false)}
                disabled={isSubmitting || success}
                className="mr-2"
              />
              <label htmlFor="paid" className="text-sm text-gray-700">
                Pago
              </label>
            </div>
            {!isFree && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Preço (moedas de reciclagem)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="mt-1 p-2 border rounded w-full"
                  value={price}
                  onChange={handlePriceChange}
                  required={!isFree}
                  disabled={isSubmitting || success}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Define o valor em moedas de reciclagem necessário para baixar
                  este modelo.
                </p>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ficheiros STL <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <label
                className={`cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded flex items-center ${
                  isSubmitting || success ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus size={16} className="mr-1" />
                Adicionar ficheiros
                <input
                  type="file"
                  accept=".stl"
                  onChange={handleFilesChange}
                  className="hidden"
                  multiple
                  disabled={isSubmitting || success}
                />
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">
                  Ficheiros selecionados:
                </p>
                <ul className="mt-1 space-y-1">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                    >
                      <span className="truncate">{file.name}</span>
                      {!isSubmitting && !success && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens do Modelo <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <label
                className={`cursor-pointer bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded flex items-center ${
                  isSubmitting || success ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus size={16} className="mr-1" />
                Adicionar imagens
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="hidden"
                  multiple
                  disabled={isSubmitting || success}
                />
              </label>
            </div>
            {images.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700">
                  Imagens selecionadas:
                </p>
                <ul className="mt-1 space-y-1">
                  {images.map((image, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                    >
                      <span className="truncate">{image.name}</span>
                      {!isSubmitting && !success && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" /> A Enviar...
              </span>
            ) : (
              "Enviar Modelo"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModelUploadModal;
