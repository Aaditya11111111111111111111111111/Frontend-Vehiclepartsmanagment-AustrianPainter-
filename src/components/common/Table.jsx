export default function DataTable({ headers, rows, emptyMessage = "No data found." }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>{emptyMessage}</td></tr>
          ) : rows}
        </tbody>
      </table>
    </div>
  );
}
