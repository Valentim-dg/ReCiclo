import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

/**
 * Componente Form
 * Renderiza um modal que pode alternar entre os formulários de Login e Registo.
 * Gere o seu próprio estado e, após um login ou registo bem-sucedido,
 * notifica o AuthContext para atualizar o estado de autenticação global.
 * @param {{ onClose: () => void }} props - As propriedades do componente.
 * @param {() => void} props.onClose - Função de callback para fechar o modal.
 */
const Form = ({ onClose }) => {
  const { login } = useAuth(); // Pega a função de login diretamente do contexto

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Lida com a submissão do formulário de login.
   * Envia as credenciais para a API, guarda o token e notifica o AuthContext.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const loginResponse = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        { email, password }
      );

      const token = loginResponse.data.key;
      if (!token) throw new Error("Token não recebido!");

      localStorage.setItem("authToken", token);

      // Notifica o AuthContext que o login foi bem-sucedido,
      // o que irá causar a busca dos dados do utilizador.
      login();
      onClose();
    } catch (err) {
      console.error("Erro ao logar:", err);
      setError("Email ou senha incorretos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Lida com a submissão do formulário de registo.
   * Cria um novo utilizador e, se for bem-sucedido, faz o login automaticamente.
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await axios.post("http://127.0.0.1:8000/api/auth/registration/", {
        username,
        email,
        password1: password,
        password2: password,
      });
      // Após o registo bem-sucedido, tenta fazer o login automaticamente.
      await handleLogin(e);
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      const errorData = err.response?.data;
      const errorMessage =
        errorData?.username?.[0] ||
        errorData?.email?.[0] ||
        errorData?.password1?.[0] ||
        "Erro ao criar conta. Verifique os dados.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold text-center mb-4">
          {isRegistering ? "Crie a sua Conta" : "Bem-vindo de Volta!"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form
          onSubmit={isRegistering ? handleRegister : handleLogin}
          className="space-y-4"
        >
          {isRegistering && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Nome de Utilizador
              </label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 w-full"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              className="border rounded-lg px-3 py-2 mt-1 w-full"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Senha</label>
            <input
              type="password"
              className="border rounded-lg px-3 py-2 mt-1 w-full"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-slate-400 flex items-center justify-center"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : isRegistering ? (
              "Cadastrar"
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">
            {isRegistering ? "Já tem uma conta? " : "Não tem conta? "}
          </span>
          <button
            className="text-sm text-blue-600 hover:underline font-medium"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(""); // Limpa os erros ao trocar de formulário
            }}
          >
            {isRegistering ? "Entrar" : "Cadastre-se"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
