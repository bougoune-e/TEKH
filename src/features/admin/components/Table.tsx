type Column<T> = { key: keyof T | string; header: string; className?: string; render?: (row: T) => React.ReactNode };

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  empty?: React.ReactNode;
};

function Table<T extends Record<string, any>>({ columns, data, empty }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-card">
      <div className="w-full overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              {columns.map((c) => (
                <th key={String(c.key)} className={`px-4 py-3 font-medium text-foreground/80 ${c.className || ""}`}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">{empty}</td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-t">
                  {columns.map((c) => (
                    <td key={String(c.key)} className={`px-4 py-3 ${c.className || ""}`}>
                      {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
