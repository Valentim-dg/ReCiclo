import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Avatar from "../ui/Avatar";
import { Camera, Loader2 } from "lucide-react";

/**
 * Componente ProfileForm
 * Renderiza um formulário que permite ao utilizador autenticado editar as suas
 * informações de perfil, como nome de utilizador, email e foto de perfil.
 * @param {{
 * currentUser: object,
 * onProfileUpdate: () => void
 * }} props - As propriedades do componente.
 * @param {object} props.currentUser - O objeto do utilizador logado, vindo do AuthContext.
 * @param {() => void} props.onProfileUpdate - Função de callback para notificar o componente pai que o perfil foi atualizado e os dados precisam de ser re-buscados.
 */
const ProfileForm = ({ currentUser, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
  });
  const [newImage, setNewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Utilizamos FormData porque estamos a enviar um ficheiro (imagem),
    // o que requer um tipo de conteúdo 'multipart/form-data'.
    const dataToSubmit = new FormData();
    dataToSubmit.append("username", formData.username);
    dataToSubmit.append("email", formData.email);
    if (newImage) {
      dataToSubmit.append("profile_image", newImage);
    }

    const token = localStorage.getItem("authToken");
    try {
      await axios.patch("http://127.0.0.1:8000/api/auth/user/", dataToSubmit, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Perfil atualizado com sucesso!");
      onProfileUpdate(); // Avisa o App/Context para re-buscar os dados do utilizador
      setNewImage(null); // Limpa a pré-visualização da nova imagem
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error.response?.data);
      const errorMessage =
        error.response?.data?.username?.[0] ||
        error.response?.data?.email?.[0] ||
        "Falha ao atualizar o perfil.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <div className="relative inline-block group">
            <Avatar
              src={newImage ? URL.createObjectURL(newImage) : currentUser.image}
              alt={currentUser.username}
              sizeClasses="w-24 h-24"
            />
            <label
              htmlFor="image-upload"
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-transform group-hover:scale-110"
              title="Mudar foto de perfil"
            >
              <Camera size={16} />
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nome de Utilizador
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:bg-slate-400 font-semibold flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> A guardar...
            </>
          ) : (
            "Guardar Alterações"
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
