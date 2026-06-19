
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

    import React, { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
  import { Customer } from "@/app/types"; 
import Skeleton from "@/components/Skeleton"; // Skeleton component for loading state
import PaginationSelection, { PaginationType } from "../Products/PaginationSelection";
import { Button } from "@/components/ui/button";
import { GrFormPrevious, GrFormNext } from "react-icons/gr"; 

import { BiFirstPage, BiLastPage } from "react-icons/bi";

interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
  searchTerm: string;
  pagination: PaginationType;
  setPagination: (
    updater: PaginationType | ((old: PaginationType) => PaginationType)
  ) => void;
}

export const CustomersTable = React.memo(function CustomersTable({
  data,
  columns,
  isLoading,
  searchTerm,
  pagination,
  setPagination,
  }: DataTableProps<Customer, unknown>) {
  const [sorting, setSorting] = useState<SortingState>([]);
    
  const filteredData = useMemo(() => {
    // Debug log - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Search term:", searchTerm);
      console.log("Data length:", data.length);
    }

    const filtered = data.filter((customer) => {
      // Search term filtering
      const searchMatch = !searchTerm ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase());

      return searchMatch;
    });

    // Debug log - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log("Filtered data length:", filtered.length);
    }

    return filtered;
  }, [data, searchTerm]);

  const table = useReactTable({
    data: filteredData || [],
    columns,
    state: {
      pagination,
      sorting,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="poppins">
      {/* Show Skeleton while loading */}
      {isLoading ? (
        <Skeleton rows={5} columns={columns.length} />
      ) : (
        <>
          <div className="rounded-md border shadow-sm">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center mt-4 space-y-2 lg:hidden">
            <PaginationSelection
              pagination={pagination}
              setPagination={setPagination}
            />
          </div>

          {/* Pagination Buttons */}
          <div className="flex justify-center items-center space-x-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <BiFirstPage />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <GrFormPrevious />
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <GrFormNext />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <BiLastPage />
            </Button>
          </div>
        </>
      )}
    </div>
  );
});
