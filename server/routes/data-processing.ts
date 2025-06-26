import { RequestHandler } from "express";
import * as XLSX from "xlsx";
import {
  UploadResponse,
  ValidationResponse,
  Client,
  Worker,
  Task,
  ValidationError,
  ValidationErrorType,
} from "../../shared/types";

interface ParsedData {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
}

// Helper function to parse CSV/Excel data
const parseFileData = (buffer: Buffer, filename: string): any[] => {
  try {
    let workbook: XLSX.WorkBook;

    if (filename.endsWith(".csv")) {
      const csvData = buffer.toString("utf8");
      workbook = XLSX.read(csvData, { type: "string" });
    } else {
      workbook = XLSX.read(buffer, { type: "buffer" });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error("Error parsing file:", error);
    throw new Error(`Failed to parse file: ${filename}`);
  }
};

// Helper function to parse array fields from CSV strings
const parseArrayField = (value: string): string[] => {
  if (!value) return [];

  // Handle JSON array format like "[1,2,3]"
  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      return JSON.parse(value);
    } catch {
      // Fallback to comma-separated parsing
      return value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim());
    }
  }

  // Handle comma-separated format
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// Data transformation functions
const transformClients = (rawData: any[]): Client[] => {
  return rawData.map((row) => ({
    ClientID: String(row.ClientID || row.clientId || ""),
    ClientName: String(row.ClientName || row.clientName || ""),
    PriorityLevel: Number(row.PriorityLevel || row.priorityLevel || 1),
    RequestedTaskIDs: parseArrayField(
      row.RequestedTaskIDs || row.requestedTaskIDs || "",
    ),
    GroupTag: String(row.GroupTag || row.groupTag || ""),
    AttributesJSON: String(row.AttributesJSON || row.attributesJSON || "{}"),
  }));
};

const transformWorkers = (rawData: any[]): Worker[] => {
  return rawData.map((row) => ({
    WorkerID: String(row.WorkerID || row.workerId || ""),
    WorkerName: String(row.WorkerName || row.workerName || ""),
    Skills: parseArrayField(row.Skills || row.skills || ""),
    AvailableSlots: parseArrayField(
      row.AvailableSlots || row.availableSlots || "",
    ).map(Number),
    MaxLoadPerPhase: Number(row.MaxLoadPerPhase || row.maxLoadPerPhase || 1),
    WorkerGroup: String(row.WorkerGroup || row.workerGroup || ""),
    QualificationLevel: Number(
      row.QualificationLevel || row.qualificationLevel || 1,
    ),
  }));
};

const transformTasks = (rawData: any[]): Task[] => {
  return rawData.map((row) => ({
    TaskID: String(row.TaskID || row.taskId || ""),
    TaskName: String(row.TaskName || row.taskName || ""),
    Category: String(row.Category || row.category || ""),
    Duration: Number(row.Duration || row.duration || 1),
    RequiredSkills: parseArrayField(
      row.RequiredSkills || row.requiredSkills || "",
    ),
    PreferredPhases: parseArrayField(
      row.PreferredPhases || row.preferredPhases || "",
    ).map(Number),
    MaxConcurrent: Number(row.MaxConcurrent || row.maxConcurrent || 1),
  }));
};

// Validation functions
const validateData = (data: ParsedData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate clients
  data.clients.forEach((client) => {
    if (!client.ClientID) {
      errors.push({
        id: `client-${Date.now()}-${Math.random()}`,
        entity: "client",
        entityId: client.ClientID || "unknown",
        field: "ClientID",
        type: ValidationErrorType.MISSING_REQUIRED_COLUMN,
        message: "ClientID is required",
        severity: "error",
      });
    }

    if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
      errors.push({
        id: `client-${Date.now()}-${Math.random()}`,
        entity: "client",
        entityId: client.ClientID,
        field: "PriorityLevel",
        type: ValidationErrorType.OUT_OF_RANGE,
        message: "PriorityLevel must be between 1 and 5",
        severity: "error",
      });
    }

    // Check for unknown task references
    client.RequestedTaskIDs.forEach((taskId) => {
      if (!data.tasks.find((task) => task.TaskID === taskId)) {
        errors.push({
          id: `client-${Date.now()}-${Math.random()}`,
          entity: "client",
          entityId: client.ClientID,
          field: "RequestedTaskIDs",
          type: ValidationErrorType.UNKNOWN_REFERENCE,
          message: `Referenced task ${taskId} does not exist`,
          severity: "error",
        });
      }
    });
  });

  // Validate workers
  data.workers.forEach((worker) => {
    if (!worker.WorkerID) {
      errors.push({
        id: `worker-${Date.now()}-${Math.random()}`,
        entity: "worker",
        entityId: worker.WorkerID || "unknown",
        field: "WorkerID",
        type: ValidationErrorType.MISSING_REQUIRED_COLUMN,
        message: "WorkerID is required",
        severity: "error",
      });
    }

    if (worker.MaxLoadPerPhase < 1) {
      errors.push({
        id: `worker-${Date.now()}-${Math.random()}`,
        entity: "worker",
        entityId: worker.WorkerID,
        field: "MaxLoadPerPhase",
        type: ValidationErrorType.OUT_OF_RANGE,
        message: "MaxLoadPerPhase must be at least 1",
        severity: "error",
      });
    }
  });

  // Validate tasks
  data.tasks.forEach((task) => {
    if (!task.TaskID) {
      errors.push({
        id: `task-${Date.now()}-${Math.random()}`,
        entity: "task",
        entityId: task.TaskID || "unknown",
        field: "TaskID",
        type: ValidationErrorType.MISSING_REQUIRED_COLUMN,
        message: "TaskID is required",
        severity: "error",
      });
    }

    if (task.Duration < 1) {
      errors.push({
        id: `task-${Date.now()}-${Math.random()}`,
        entity: "task",
        entityId: task.TaskID,
        field: "Duration",
        type: ValidationErrorType.OUT_OF_RANGE,
        message: "Duration must be at least 1",
        severity: "error",
      });
    }
  });

  // Check for duplicate IDs
  const clientIds = data.clients.map((c) => c.ClientID);
  const workerIds = data.workers.map((w) => w.WorkerID);
  const taskIds = data.tasks.map((t) => t.TaskID);

  // Find duplicates
  [
    { ids: clientIds, entity: "client" as const },
    { ids: workerIds, entity: "worker" as const },
    { ids: taskIds, entity: "task" as const },
  ].forEach(({ ids, entity }) => {
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    duplicates.forEach((id) => {
      errors.push({
        id: `${entity}-dup-${Date.now()}-${Math.random()}`,
        entity,
        entityId: id,
        type: ValidationErrorType.DUPLICATE_ID,
        message: `Duplicate ${entity} ID: ${id}`,
        severity: "error",
      });
    });
  });

  return errors;
};

export const handleFileUpload: RequestHandler = async (req, res) => {
  try {
    // In a real implementation, you'd use multer or similar for file upload
    // For now, we'll simulate with the sample data

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Load sample data (in a real implementation, this would parse uploaded files)
    const sampleData: ParsedData = {
      clients: [
        {
          ClientID: "C001",
          ClientName: "Tech Corporation",
          PriorityLevel: 5,
          RequestedTaskIDs: ["T001", "T002"],
          GroupTag: "Enterprise",
          AttributesJSON: '{"budget": 100000, "region": "North"}',
        },
        {
          ClientID: "C002",
          ClientName: "Marketing Solutions Inc",
          PriorityLevel: 3,
          RequestedTaskIDs: ["T003", "T004"],
          GroupTag: "SMB",
          AttributesJSON: '{"budget": 50000, "region": "South"}',
        },
      ],
      workers: [
        {
          WorkerID: "W001",
          WorkerName: "John Smith",
          Skills: ["JavaScript", "React", "Node.js"],
          AvailableSlots: [1, 2, 3],
          MaxLoadPerPhase: 2,
          WorkerGroup: "Frontend",
          QualificationLevel: 4,
        },
        {
          WorkerID: "W002",
          WorkerName: "Jane Doe",
          Skills: ["Python", "Django", "PostgreSQL"],
          AvailableSlots: [2, 3, 4],
          MaxLoadPerPhase: 3,
          WorkerGroup: "Backend",
          QualificationLevel: 5,
        },
      ],
      tasks: [
        {
          TaskID: "T001",
          TaskName: "Frontend Dashboard Development",
          Category: "Development",
          Duration: 2,
          RequiredSkills: ["JavaScript", "React"],
          PreferredPhases: [1, 2],
          MaxConcurrent: 2,
        },
        {
          TaskID: "T002",
          TaskName: "Backend API Implementation",
          Category: "Development",
          Duration: 3,
          RequiredSkills: ["Python", "Django"],
          PreferredPhases: [2, 3, 4],
          MaxConcurrent: 1,
        },
      ],
    };

    const validationErrors = validateData(sampleData);

    const response: UploadResponse = {
      success: true,
      data: sampleData,
      errors: validationErrors,
      message: "Files processed successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error processing files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process files",
      errors: [],
    });
  }
};

export const handleValidation: RequestHandler = async (req, res) => {
  try {
    const { clients, workers, tasks } = req.body;

    const data: ParsedData = { clients, workers, tasks };
    const errors = validateData(data);

    const response: ValidationResponse = {
      errors,
      summary: {
        totalErrors: errors.length,
        errorsByType: errors.reduce(
          (acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1;
            return acc;
          },
          {} as Record<ValidationErrorType, number>,
        ),
        errorsBySeverity: {
          error: errors.filter((e) => e.severity === "error").length,
          warning: errors.filter((e) => e.severity === "warning").length,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error validating data:", error);
    res.status(500).json({
      errors: [],
      summary: {
        totalErrors: 0,
        errorsByType: {},
        errorsBySeverity: { error: 0, warning: 0 },
      },
    });
  }
};
