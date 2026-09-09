import React, { useState } from "react";
import { Table, Pagination, Loader, Box, Text } from "@mantine/core";
import { FileSearch } from "lucide-react";
import classes from "./FTable.module.scss";

export interface ColumnDef<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface FTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  noDataText?: string;
  itemsPerPage?: number;
  totalServerPages?: number;
  activeServerPage?: number;
  onPageChange?: (page: number) => void;
}

export function FTable<T extends { _id?: string; id?: string }>({
  columns,
  data,
  loading = false,
  noDataText = "No data found",
  itemsPerPage = 10,
  totalServerPages,
  activeServerPage,
  onPageChange,
}: FTableProps<T>) {
  const [localPage, setLocalPage] = useState(1);

  const isServerPaginated = totalServerPages !== undefined && onPageChange !== undefined;
  
  const activePage = isServerPaginated ? (activeServerPage || 1) : localPage;
  const setPage = isServerPaginated ? onPageChange : setLocalPage;
  const totalPages = isServerPaginated ? totalServerPages : Math.ceil((data?.length || 0) / itemsPerPage);

  // If server paginated, use all data directly since it's already paginated by backend
  const paginatedData = isServerPaginated
    ? (data || [])
    : (data || []).slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  const renderContent = () => {
    if (loading) {
      return (
        <div className={classes.emptyState}>
          <Loader color="var(--primary-accent)" />
          <Text mt="md" color="dimmed">
            Loading data...
          </Text>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className={classes.emptyState}>
          <FileSearch size={48} color="var(--text-secondary)" opacity={0.5} />
          <Text mt="md" color="dimmed" size="lg">
            {noDataText}
          </Text>
        </div>
      );
    }

    return (
      <Box className={classes.tableWrapper}>
        <Table className={classes.table}>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.key}>{col.label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedData.map((row, index) => {
              const rowKey = row._id || row.id || `row-${index}`;
              return (
                <Table.Tr key={rowKey}>
                  {columns.map((col) => (
                    <Table.Td key={`${rowKey}-${col.key}`}>
                      {col.render
                        ? col.render(row)
                        : (row[col.key as keyof T] as React.ReactNode)}
                    </Table.Td>
                  ))}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Box>
    );
  };

  return (
    <div className={classes.fTableContainer}>
      {renderContent()}
      
      {!loading && totalPages > 1 && (
        <div className={classes.paginationWrapper}>
          <Pagination
            value={activePage}
            onChange={setPage}
            total={totalPages}
            color="indigo"
          />
        </div>
      )}
    </div>
  );
}
