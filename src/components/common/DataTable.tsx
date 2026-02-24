import { useState } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
    key: keyof T | "actions" | "checkbox";
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    pageSize?: number;
    onPageSizeChange?: (size: number) => void;
    selectable?: boolean;
    onSelectionChange?: (selectedIds: string[]) => void;
    uniqueKey: keyof T;
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    onRowClick,
    pageSize = 10,
    onPageSizeChange,
    selectable = false,
    onSelectionChange,
    uniqueKey
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSort = (key: keyof T) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const toggleSelectAll = () => {
        if (selectedIds.length === paginatedData.length) {
            setSelectedIds([]);
            onSelectionChange?.([]);
        } else {
            const allIds = paginatedData.map(item => String(item[uniqueKey]));
            setSelectedIds(allIds);
            onSelectionChange?.(allIds);
        }
    };

    const toggleSelectRow = (id: string) => {
        const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];
        setSelectedIds(newSelection);
        onSelectionChange?.(newSelection);
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            {selectable && (
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A]"
                                        checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.header}
                                    className={`px-6 py-4 font-semibold ${column.sortable ? "cursor-pointer hover:text-[#0F172A]" : ""}`}
                                    onClick={() => column.sortable && handleSort(column.key as keyof T)}
                                >
                                    <div className="flex items-center gap-1">
                                        {column.header}
                                        {column.sortable && sortConfig?.key === column.key && (
                                            sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedData.map((item) => (
                            <tr
                                key={String(item[uniqueKey])}
                                className={`hover:bg-slate-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {selectable && (
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-[#0F172A] focus:ring-[#0F172A]"
                                            checked={selectedIds.includes(String(item[uniqueKey]))}
                                            onChange={() => toggleSelectRow(String(item[uniqueKey]))}
                                        />
                                    </td>
                                )}
                                {columns.map((column) => (
                                    <td key={column.header} className="px-6 py-4 text-slate-600">
                                        {column.key === "actions" ? (
                                            <button className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                            </button>
                                        ) : (
                                            column.render ? column.render(item) : item[column.key as keyof T]
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-slate-400">
                                    No data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">
                        Showing <span className="font-semibold text-[#0F172A]">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                        <span className="font-semibold text-[#0F172A]">{Math.min(currentPage * pageSize, data.length)}</span> of{" "}
                        <span className="font-semibold text-[#0F172A]">{data.length}</span> entries
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Show:</span>
                        <select
                            className="bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#0F172A] py-1 px-2 focus:outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
                            value={pageSize}
                            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${currentPage === i + 1
                                ? "bg-[#0F172A] text-white"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {i + 1}
                        </button>
                    )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
