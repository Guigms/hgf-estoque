// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // Redireciona para cá se não estiver autenticado
  },
});

export const config = {
  // Protege TODAS as rotas, EXCETO a página de login, rotas de API públicas e ficheiros estáticos
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};