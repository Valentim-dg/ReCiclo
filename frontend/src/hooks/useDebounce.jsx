import { useState, useEffect } from "react";

/**
 * Hook customizado useDebounce
 * Atrasa a atualização de um valor, útil para evitar chamadas excessivas à API
 * em campos de pesquisa. O valor "debounced" só é atualizado após um determinado
 * período de inatividade (delay).
 * @param {any} value - O valor a ser "atrasado" (ex: o termo de uma pesquisa).
 * @param {number} delay - O tempo de atraso em milissegundos.
 * @returns {any} Retorna o valor "atrasado" após o delay.
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura um temporizador para atualizar o valor debounced após o 'delay'.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o temporizador se o valor mudar antes do delay terminar.
    // Isto garante que a atualização só acontece quando o utilizador para de digitar.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Roda novamente apenas se o valor ou o delay mudarem.

  return debouncedValue;
}
