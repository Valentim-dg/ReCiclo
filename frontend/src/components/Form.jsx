import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";

const Form = ({ onClose, setUser }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState(""); // Alterado de name para username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const loginResponse = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        { email, password }
      );

      const token = loginResponse.data.key;
      if (!token) throw new Error("Token não recebido!");

      localStorage.setItem("authToken", token);

      // Buscar dados do usuário
      const userResponse = await axios.get(
        "http://127.0.0.1:8000/api/auth/user/",
        { headers: { Authorization: `Token ${token}` } }
      );

      const userData = {
        id: userResponse.data.id,
        username: userResponse.data.username,
        email: userResponse.data.email,
        profileImage: userResponse.data.profile_image || "/default-avatar.png",
        token: token,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      onClose();
    } catch (err) {
      console.error("Erro ao logar:", err);
      setError("Email ou senha incorretos.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Registro do usuário
      const registerResponse = await axios.post(
        "http://127.0.0.1:8000/api/auth/registration/",
        {
          username,
          email,
          password1: password, // Django Allauth espera password1 e password2
          password2: password,
        }
      );

      console.log("Usuário cadastrado:", registerResponse.data);

      // Fazer login automaticamente após registro
      await handleLogin(e);
    } catch (err) {
      console.error("Erro ao cadastrar:", err);

      if (err.response && err.response.data) {
        const errorData = err.response.data;
        let errorMessage = "Erro ao criar conta.";

        if (errorData.username) {
          errorMessage = errorData.username[0];
        } else if (errorData.email) {
          errorMessage = errorData.email[0];
        } else if (errorData.password1) {
          errorMessage = errorData.password1[0];
        }

        setError(errorMessage);
      } else {
        setError("Erro ao criar conta. Verifique os dados e tente novamente.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-96">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-center mb-4">
          {isRegistering ? "Cadastre-se" : "Entrar"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-2">{error}</p>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          {isRegistering && (
            <>
              <label className="text-sm font-medium text-gray-600">
                Nome de Usuário
              </label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-4 text-sm w-full"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </>
          )}

          <label className="text-sm font-medium text-gray-600">E-mail</label>
          <input
            type="email"
            className="border rounded-lg px-3 py-2 mt-1 mb-4 text-sm w-full"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="text-sm font-medium text-gray-600">Senha</label>
          <input
            type="password"
            className="border rounded-lg px-3 py-2 mt-1 mb-4 text-sm w-full"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isRegistering ? "Cadastrar" : "Entrar"}
          </button>
        </form>

        <div className="text-center mt-2">
          <span className="text-sm text-gray-500">
            {isRegistering ? "Já tem uma conta? " : "Não tem conta? "}
          </span>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Entrar" : "Cadastre-se"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
