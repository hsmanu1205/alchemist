import React from "react";
import { AlertTriangle, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ValidationError, ValidationErrorType } from "@shared/types";
import { Button } from "./button";
import { Badge } from "./badge";

interface ValidationPanelProps {
  errors: ValidationError[];
  onErrorClick?: (error: ValidationError) => void;
  onClearError?: (errorId: string) => void;
  className?: string;
}

export function ValidationPanel({
  errors,
  onErrorClick,
  onClearError,
  className,
}: ValidationPanelProps) {
  const errorsByType = errors.reduce(
    (acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    },
    {} as Record<ValidationErrorType, number>,
  );

  const errorsBySeverity = errors.reduce(
    (acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    },
    { error: 0, warning: 0 },
  );

  const getSeverityIcon = (severity: "error" | "warning") => {
    switch (severity) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: "error" | "warning") => {
    switch (severity) {
      case "error":
        return "border-destructive/20 bg-destructive/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      default:
        return "border-border bg-background";
    }
  };

  const getErrorTypeLabel = (type: ValidationErrorType): string => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (errors.length === 0) {
    return (
      <div
        className={cn(
          "p-6 border border-success/20 bg-success/5 rounded-lg",
          className,
        )}
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-success" />
          <div>
            <h3 className="text-lg font-semibold text-success">
              All Validations Passed!
            </h3>
            <p className="text-sm text-success/80">
              Your data is ready for processing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary */}
      <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">
                Validation Issues Found
              </h3>
              <p className="text-sm text-destructive/80">
                {errorsBySeverity.error} error(s), {errorsBySeverity.warning}{" "}
                warning(s)
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge variant="destructive">{errorsBySeverity.error} Errors</Badge>
            <Badge
              variant="secondary"
              className="bg-warning/10 text-warning border-warning/20"
            >
              {errorsBySeverity.warning} Warnings
            </Badge>
          </div>
        </div>
      </div>

      {/* Error Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(errorsByType).map(([type, count]) => (
          <div
            key={type}
            className="p-3 border border-border bg-card rounded-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {getErrorTypeLabel(type as ValidationErrorType)}
              </p>
              <Badge variant="outline">{count}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Errors */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">
          Individual Issues:
        </h4>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {errors.map((error) => (
            <div
              key={error.id}
              className={cn(
                "p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-sm",
                getSeverityColor(error.severity),
                onErrorClick && "hover:border-primary/30",
              )}
              onClick={() => onErrorClick?.(error)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(error.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {error.entity}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        {error.entityId}
                      </span>
                      {error.field && (
                        <Badge variant="secondary" className="text-xs">
                          {error.field}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{error.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: {getErrorTypeLabel(error.type)}
                    </p>
                  </div>
                </div>
                {onClearError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearError(error.id);
                    }}
                    className="h-8 w-8 p-0 hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
