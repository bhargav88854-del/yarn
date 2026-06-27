export function PageHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-30 flex items-end justify-between gap-4 border-b bg-card/80 px-5 py-4 backdrop-blur sm:px-8 sm:py-5">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="hidden h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary sm:grid">
            {icon}
          </span>
        )}
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
