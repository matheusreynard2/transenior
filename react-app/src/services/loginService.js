import API_BASE from "../config/api";

export async function realizarLogin({ email, senha }) {
  return fetch(`${API_BASE}/login/realizarLogin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });
}
