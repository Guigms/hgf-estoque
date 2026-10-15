// src/app/layout.tsx
import type { Metadata } from 'next';
import { Sidebar } from '@/components/Sidebar';
import { Providers } from '@/components/Provider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import './globals.css';

export const metadata: Metadata = {
  title: 'HGF Estoque | SGH',
  description: 'Sistema de Gestão Hospitalar de Estoque e Dispensação',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Busca a sessão no servidor. Se estiver na página de login, session será null.
  const session = await getServerSession(authOptions);
  
  // Pega o cargo do utilizador, se não existir sessão assume um fallback seguro
  const userRole = (session?.user as any)?.role || 'SOLICITANTE';

  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 flex min-h-screen font-sans overflow-hidden">
        <Providers>
          
          {/* A Sidebar SÓ é renderizada se existir uma sessão válida */}
          {session && <Sidebar userRole={userRole} />}

          {/* ÁREA DINÂMICA DAS PÁGINAS */}
          <div className="flex-1 min-w-0 h-screen overflow-y-auto">
            {children}
          </div>

        </Providers>
      </body>
    </html>
  );
}