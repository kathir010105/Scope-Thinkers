import { flexRender, tableFeatures, useTable } from "@tanstack/react-table";
import { Pencil, Trash2, FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = tableFeatures({});

export default function ProjectsTable({ projects, onEdit, onDelete }) {
  const navigate = useNavigate();

  const columns = [
    {
      accessorKey: "name",
      header: "Project",

      cell: ({ row }) => {
        const project = row.original;

        return (
          <button
            type="button"
            onClick={() => navigate(`/projects/${project.id}`)}
            className="group flex w-full items-center gap-3 text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/10 text-[#22c55e] transition group-hover:bg-[#22c55e]/15">
              <FolderKanban size={17} />
            </div>

            <div className="min-w-0">
              <p className="font-medium text-white transition group-hover:text-[#22c55e]">
                {project.name}
              </p>

              {project.description && (
                <p className="mt-0.5 max-w-[360px] truncate text-xs text-white/40">
                  {project.description}
                </p>
              )}
            </div>
          </button>
        );
      },
    },

    {
      accessorKey: "status",
      header: "Status",

      cell: ({ row }) => {
        const status = row.original.status;

        const styles = {
          active: "border-[#22c55e]/20 bg-[#22c55e]/10 text-[#22c55e]",

          completed: "border-blue-500/20 bg-blue-500/10 text-blue-400",

          archived: "border-white/10 bg-white/5 text-white/40",
        };

        return (
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
              styles[status] || styles.archived
            }`}
          >
            {status}
          </span>
        );
      },
    },

    {
      accessorKey: "created_at",
      header: "Created",

      cell: ({ row }) => {
        const date = row.original.created_at;

        if (!date) {
          return <span className="text-white/30">—</span>;
        }

        return (
          <span className="text-white/45">
            {new Date(date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },

    {
      id: "actions",
      header: "",

      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(row.original);
            }}
            className="rounded-lg p-2 text-white/35 transition hover:bg-white/5 hover:text-white"
            title="Edit project"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(row.original);
            }}
            className="rounded-lg p-2 text-white/35 transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const table = useTable({
    features,
    columns,
    data: projects,
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead className="border-b border-white/10 bg-white/[0.02]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-sm text-white/30"
              >
                No projects found.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/5 transition last:border-b-0 hover:bg-white/[0.02]"
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
