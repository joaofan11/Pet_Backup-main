export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function login(email: string, senha: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const data = await res.json();
  if (data.token) localStorage.setItem("token", data.token);
  return data;
}
