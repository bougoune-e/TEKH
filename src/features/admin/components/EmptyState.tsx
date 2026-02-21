type Props = { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode };

const EmptyState = ({ title, description, action, icon }: Props) => {
  return (
    <div className="border rounded-lg p-8 text-center bg-card">
      {icon ? <div className="mx-auto mb-3 h-10 w-10 grid place-items-center rounded-lg bg-gradient-subtle">{icon}</div> : null}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description ? <p className="text-sm text-muted-foreground mb-4">{description}</p> : null}
      {action}
    </div>
  );
};

export default EmptyState;
