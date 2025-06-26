import React, { useState, useMemo } from "react";
import { Edit, Save, X, Search, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { ValidationError } from "@shared/types";

interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "array" | "json";
  editable?: boolean;
  required?: boolean;
  width?: string;
}

interface DataGridProps<T = any> {
  data: T[];
  columns: Column[];
  onUpdateData: (updatedData: T[]) => void;
  validationErrors?: ValidationError[];
  entityType: "client" | "worker" | "task";
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export function DataGrid<T extends Record<string, any>>({
  data,
  columns,
  onUpdateData,
  validationErrors = [],
  entityType,
  searchQuery = "",
  onSearchChange,
  className,
}: DataGridProps<T>) {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnKey: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Create error lookup for quick access
  const errorLookup = useMemo(() => {
    const lookup: Record<string, ValidationError[]> = {};
    validationErrors
      .filter((error) => error.entity === entityType)
      .forEach((error) => {
        const key = `${error.entityId}-${error.field || "general"}`;
        if (!lookup[key]) lookup[key] = [];
        lookup[key].push(error);
      });
    return lookup;
  }, [validationErrors, entityType]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((value) => {
        if (value == null) return false;
        const stringValue = Array.isArray(value)
          ? value.join(", ")
          : String(value);
        return stringValue.toLowerCase().includes(query);
      }),
    );
  }, [data, searchQuery]);

  const startEdit = (
    rowIndex: number,
    columnKey: string,
    currentValue: any,
  ) => {
    setEditingCell({ rowIndex, columnKey });
    setEditValue(
      Array.isArray(currentValue)
        ? currentValue.join(", ")
        : String(currentValue || ""),
    );
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const { rowIndex, columnKey } = editingCell;
    const originalRowIndex = data.findIndex(
      (item) => item === filteredData[rowIndex],
    );

    if (originalRowIndex === -1) return;

    const updatedData = [...data];
    const column = columns.find((col) => col.key === columnKey);

    let processedValue: any = editValue;

    // Process value based on column type
    if (column?.type === "array") {
      processedValue = editValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (column?.type === "number") {
      processedValue = Number(editValue) || 0;
    } else if (column?.type === "json") {
      try {
        processedValue = JSON.parse(editValue);
      } catch {
        processedValue = editValue; // Keep as string if invalid JSON
      }
    }

    updatedData[originalRowIndex] = {
      ...updatedData[originalRowIndex],
      [columnKey]: processedValue,
    };

    onUpdateData(updatedData);
    setEditingCell(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const getDisplayValue = (value: any, type?: string) => {
    if (value == null) return "";

    switch (type) {
      case "array":
        return Array.isArray(value) ? value.join(", ") : String(value);
      case "json":
        return typeof value === "object"
          ? JSON.stringify(value, null, 2)
          : String(value);
      default:
        return String(value);
    }
  };

  const getCellErrors = (rowData: T, columnKey: string) => {
    const entityId = rowData[`${entityType}ID`] || rowData.id;
    return errorLookup[`${entityId}-${columnKey}`] || [];
  };

  const getRowErrors = (rowData: T) => {
    const entityId = rowData[`${entityType}ID`] || rowData.id;
    return validationErrors.filter(
      (error) => error.entity === entityType && error.entityId === entityId,
    );
  };

  if (filteredData.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-muted-foreground">
          {data.length === 0 ? (
            <p>No data available. Upload a file to get started.</p>
          ) : (
            <p>No results found for "{searchQuery}".</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Actions */}
      {onSearchChange && (
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${entityType}s...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {filteredData.length} of {data.length} rows
            </Badge>
          </div>
        </div>
      )}

      {/* Data Grid */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border",
                      column.width && `w-${column.width}`,
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => {
                const rowErrors = getRowErrors(row);
                const hasRowErrors = rowErrors.length > 0;

                return (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "border-b border-border hover:bg-muted/25 transition-colors",
                      hasRowErrors && "bg-destructive/5",
                    )}
                  >
                    {columns.map((column) => {
                      const cellErrors = getCellErrors(row, column.key);
                      const hasCellErrors = cellErrors.length > 0;
                      const isEditing =
                        editingCell?.rowIndex === rowIndex &&
                        editingCell?.columnKey === column.key;

                      return (
                        <td
                          key={column.key}
                          className={cn(
                            "px-4 py-3 text-sm text-foreground relative",
                            hasCellErrors && "bg-destructive/10",
                          )}
                        >
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit();
                                  if (e.key === "Escape") cancelEdit();
                                }}
                                className="text-sm"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={saveEdit}
                                className="h-8 w-8 p-0"
                              >
                                <Save className="w-4 h-4 text-success" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEdit}
                                className="h-8 w-8 p-0"
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <div className="flex-1 min-w-0">
                                <div
                                  className={cn(
                                    "truncate",
                                    column.type === "json" &&
                                      "font-mono text-xs",
                                  )}
                                  title={getDisplayValue(
                                    row[column.key],
                                    column.type,
                                  )}
                                >
                                  {getDisplayValue(
                                    row[column.key],
                                    column.type,
                                  )}
                                </div>
                                {hasCellErrors && (
                                  <div className="mt-1">
                                    {cellErrors.map((error, errorIndex) => (
                                      <Badge
                                        key={errorIndex}
                                        variant="destructive"
                                        className="text-xs mr-1"
                                      >
                                        {error.type.replace(/_/g, " ")}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {column.editable && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    startEdit(
                                      rowIndex,
                                      column.key,
                                      row[column.key],
                                    )
                                  }
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      {hasRowErrors && (
                        <Badge variant="destructive" className="text-xs">
                          {rowErrors.length} error(s)
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredData.length} of {data.length} {entityType}s
        </span>
        {validationErrors.length > 0 && (
          <span className="text-destructive">
            {validationErrors.filter((e) => e.entity === entityType).length}{" "}
            validation error(s)
          </span>
        )}
      </div>
    </div>
  );
}
