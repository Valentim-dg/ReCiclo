import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

const ModelUploadModal = ({ closeModal, user, setModels }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Obtém o token correto do localStorage
  const token = localStorage.getItem("authToken");
  console.log("Token enviado:", token);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Apenas um arquivo STL
    console.log("Arquivo selecionado:", e.target.files[0]);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Apenas uma imagem
    console.log("Imagem selecionada:", e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user || !token) {
      setError("Você precisa estar logado para enviar um modelo.");
      return;
    }

    if (!name || !description || !file) {
      setError("Preencha todos os campos e envie pelo menos um arquivo.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("file", file);
    if (image) {
      formData.append("image", image);
    }

    console.log("Enviando formulário:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/models3d/",
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Resposta da API:", response.data);

      alert("Modelo enviado com sucesso!");
      setModels((prevModels) => [response.data, ...prevModels]);
      closeModal();
    } catch (error) {
      console.error("Erro ao enviar modelo:", error);
      console.log("Erro detalhes:", error.response);
      setError("Erro ao enviar modelo. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold">Adicionar Modelo 3D</h2>
          <button onClick={closeModal}>
            <X size={20} className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-4">
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
            />
          </div>

          {/* Upload do Arquivo STL */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Arquivo STL
            </label>
            <input
              type="file"
              accept=".stl"
              onChange={handleFileChange}
              required
            />
            {file && <p className="text-sm text-gray-500 mt-1">{file.name}</p>}
          </div>

          {/* Upload da Imagem */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Imagem do Modelo (Opcional)
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {image && (
              <p className="text-sm text-gray-500 mt-1">{image.name}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Modelo"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModelUploadModal;
