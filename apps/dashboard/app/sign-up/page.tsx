export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10 text-foreground">
      <section className="flex w-full max-w-sm flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold">Dashboard Unificada OpenLDR</h1>
          <p className="mt-1 text-sm text-muted-foreground">Crie uma conta para continuar.</p>
        </div>
        <p className="text-sm text-muted-foreground">
          A shell agora usa Clerk globalmente, seguindo a dashboard TB. Configure o fluxo de autenticação
          Clerk/customizado para criar contas.
        </p>
      </section>
    </main>
  );
}
