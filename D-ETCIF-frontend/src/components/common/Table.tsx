export default function Table({ columns, data }: { columns: any[], data: any[] }) {
  return (
    <table className="w-full border">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="p-2 border text-left">
              {c.title}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
            {columns.map((c) => (
              <td key={c.key} className="p-2 border">
                {row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}