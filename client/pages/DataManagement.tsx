import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Sparkles,
  RefreshCw,
  Search,
  Brain,
  CheckCircle,
  AlertTriangle,
  Database,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar3D } from "@/components/ui/navbar-3d";
import { DataGrid } from "@/components/ui/data-grid";
import { ValidationPanel } from "@/components/ui/validation-panel";
import {
  Client,
  Worker,
  Task,
  ValidationError,
  DataState,
} from "@shared/types";

// Sample data for demonstration
const sampleClients: Client[] = [
  {
    ClientID: "C001",
    ClientName: "Tech Corp",
    PriorityLevel: 5,
    RequestedTaskIDs: ["T001", "T002"],
    GroupTag: "Enterprise",
    AttributesJSON: '{"budget": 100000, "region": "North"}',
  },
  {
    ClientID: "C002",
    ClientName: "Marketing Inc",
    PriorityLevel: 3,
    RequestedTaskIDs: ["T003", "T004"],
    GroupTag: "SMB",
    AttributesJSON: '{"budget": 50000, "region": "South"}',
  },
];

const sampleWorkers: Worker[] = [
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
];

const sampleTasks: Task[] = [
  {
    TaskID: "T001",
    TaskName: "Frontend Development",
    Category: "Development",
    Duration: 2,
    RequiredSkills: ["JavaScript", "React"],
    PreferredPhases: [1, 2],
    MaxConcurrent: 2,
  },
  {
    TaskID: "T002",
    TaskName: "Backend API",
    Category: "Development",
    Duration: 3,
    RequiredSkills: ["Python", "Django"],
    PreferredPhases: [2, 3, 4],
    MaxConcurrent: 1,
  },
];

// Sample validation errors for demonstration
const sampleValidationErrors: ValidationError[] = [
  {
    id: "v001",
    entity: "client",
    entityId: "C001",
    field: "RequestedTaskIDs",
    type: "unknown_reference" as any,
    message: "Referenced task T005 does not exist in tasks data",
    severity: "error",
  },
  {
    id: "v002",
    entity: "worker",
    entityId: "W001",
    field: "AvailableSlots",
    type: "out_of_range" as any,
    message: "Phase 6 is out of expected range (1-5)",
    severity: "warning",
  },
];

const clientColumns = [
  { key: "ClientID", label: "Client ID", required: true },
  { key: "ClientName", label: "Name", editable: true, required: true },
  {
    key: "PriorityLevel",
    label: "Priority",
    type: "number" as const,
    editable: true,
    required: true,
  },
  {
    key: "RequestedTaskIDs",
    label: "Requested Tasks",
    type: "array" as const,
    editable: true,
  },
  { key: "GroupTag", label: "Group", editable: true },
  {
    key: "AttributesJSON",
    label: "Attributes",
    type: "json" as const,
    editable: true,
  },
];

const workerColumns = [
  { key: "WorkerID", label: "Worker ID", required: true },
  { key: "WorkerName", label: "Name", editable: true, required: true },
  { key: "Skills", label: "Skills", type: "array" as const, editable: true },
  {
    key: "AvailableSlots",
    label: "Available Slots",
    type: "array" as const,
    editable: true,
  },
  {
    key: "MaxLoadPerPhase",
    label: "Max Load",
    type: "number" as const,
    editable: true,
  },
  { key: "WorkerGroup", label: "Group", editable: true },
  {
    key: "QualificationLevel",
    label: "Qualification",
    type: "number" as const,
    editable: true,
  },
];

const taskColumns = [
  { key: "TaskID", label: "Task ID", required: true },
  { key: "TaskName", label: "Name", editable: true, required: true },
  { key: "Category", label: "Category", editable: true },
  {
    key: "Duration",
    label: "Duration",
    type: "number" as const,
    editable: true,
  },
  {
    key: "RequiredSkills",
    label: "Required Skills",
    type: "array" as const,
    editable: true,
  },
  {
    key: "PreferredPhases",
    label: "Preferred Phases",
    type: "array" as const,
    editable: true,
  },
  {
    key: "MaxConcurrent",
    label: "Max Concurrent",
    type: "number" as const,
    editable: true,
  },
];

export default function DataManagement() {
  // Load data from sessionStorage (set by upload page)
  const loadStoredData = () => {
    try {
      const storedData = sessionStorage.getItem("processedData");
      const storedErrors = sessionStorage.getItem("validationErrors");

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const parsedErrors = storedErrors ? JSON.parse(storedErrors) : [];

        return {
          clients: parsedData.clients || sampleClients,
          workers: parsedData.workers || sampleWorkers,
          tasks: parsedData.tasks || sampleTasks,
          validationErrors: parsedErrors,
        };
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    }

    // Fallback to sample data
    return {
      clients: sampleClients,
      workers: sampleWorkers,
      tasks: sampleTasks,
      validationErrors: sampleValidationErrors,
    };
  };

  const initialData = loadStoredData();

  const [dataState, setDataState] = useState<DataState>({
    ...initialData,
    rules: [],
    priorities: {
      priorityLevel: 1,
      taskFulfillment: 1,
      fairnessConstraints: 1,
      workloadBalance: 1,
      skillMatch: 1,
      phasePreference: 1,
    },
    isLoading: false,
  });

  const [searchQueries, setSearchQueries] = useState({
    clients: "",
    workers: "",
    tasks: "",
  });

  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [activeTab, setActiveTab] = useState("clients");

  // Simulate validation on data changes
  useEffect(() => {
    // This would call the validation API in a real implementation
    // For now, we'll keep the sample errors
  }, [dataState.clients, dataState.workers, dataState.tasks]);

  const handleDataUpdate = (
    entityType: "clients" | "workers" | "tasks",
    updatedData: any[],
  ) => {
    setDataState((prev) => ({
      ...prev,
      [entityType]: updatedData,
    }));
  };

  const handleValidation = async () => {
    setDataState((prev) => ({ ...prev, isLoading: true }));

    // Simulate API call
    setTimeout(() => {
      setDataState((prev) => ({ ...prev, isLoading: false }));
    }, 1000);
  };

  const handleNaturalLanguageSearch = async () => {
    // This would call the AI search API
    console.log("Natural language search:", naturalLanguageQuery);
  };

  const errorSummary = {
    total: dataState.validationErrors.length,
    errors: dataState.validationErrors.filter((e) => e.severity === "error")
      .length,
    warnings: dataState.validationErrors.filter((e) => e.severity === "warning")
      .length,
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(107, 38, 217, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(36, 99, 235, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0f1419 0%, #1a1a2e 50%, #16213e 100%)
        `,
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-brand-secondary/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-accent/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <Navbar3D />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Search Bar */}
            <Card className="glass-morphism border-white/20 hover:border-white/30 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-5 h-5 text-purple-300 animate-rotate-y" />
                  </div>
                  <span className="text-xl">Natural Language Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="e.g., 'All tasks having Duration more than 1 phase and having phase 2 in their Preferred Phases'"
                      value={naturalLanguageQuery}
                      onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-brand-accent focus:ring-brand-accent/20"
                    />
                  </div>
                  <Button
                    onClick={handleNaturalLanguageSearch}
                    disabled={!naturalLanguageQuery.trim()}
                    className="button-3d bg-gradient-to-r from-brand-primary to-brand-secondary"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
                <p className="text-sm text-white/70 mt-3">
                  Describe what you're looking for in plain English and let AI
                  find the data for you.
                </p>
              </CardContent>
            </Card>

            {/* Data Tabs */}
            <Card className="glass-morphism border-white/20 hover:border-white/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-cyan-300" />
                    </div>
                    <span className="text-xl">Data Management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-brand-primary/20 text-brand-accent border-brand-accent/30"
                    >
                      {dataState.clients.length +
                        dataState.workers.length +
                        dataState.tasks.length}{" "}
                      total records
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                      value="clients"
                      className="flex items-center space-x-2"
                    >
                      <span>Clients</span>
                      <Badge variant="secondary">
                        {dataState.clients.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="workers"
                      className="flex items-center space-x-2"
                    >
                      <span>Workers</span>
                      <Badge variant="secondary">
                        {dataState.workers.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="tasks"
                      className="flex items-center space-x-2"
                    >
                      <span>Tasks</span>
                      <Badge variant="secondary">
                        {dataState.tasks.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="clients" className="mt-6">
                    <DataGrid
                      data={dataState.clients}
                      columns={clientColumns}
                      onUpdateData={(data) => handleDataUpdate("clients", data)}
                      validationErrors={dataState.validationErrors}
                      entityType="client"
                      searchQuery={searchQueries.clients}
                      onSearchChange={(query) =>
                        setSearchQueries((prev) => ({
                          ...prev,
                          clients: query,
                        }))
                      }
                    />
                  </TabsContent>

                  <TabsContent value="workers" className="mt-6">
                    <DataGrid
                      data={dataState.workers}
                      columns={workerColumns}
                      onUpdateData={(data) => handleDataUpdate("workers", data)}
                      validationErrors={dataState.validationErrors}
                      entityType="worker"
                      searchQuery={searchQueries.workers}
                      onSearchChange={(query) =>
                        setSearchQueries((prev) => ({
                          ...prev,
                          workers: query,
                        }))
                      }
                    />
                  </TabsContent>

                  <TabsContent value="tasks" className="mt-6">
                    <DataGrid
                      data={dataState.tasks}
                      columns={taskColumns}
                      onUpdateData={(data) => handleDataUpdate("tasks", data)}
                      validationErrors={dataState.validationErrors}
                      entityType="task"
                      searchQuery={searchQueries.tasks}
                      onSearchChange={(query) =>
                        setSearchQueries((prev) => ({ ...prev, tasks: query }))
                      }
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Data Summary */}
            <Card className="glass-morphism border-white/20 hover:border-white/30 transition-all duration-300 card-3d">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Data Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
                    <span className="text-sm text-white/80">Clients</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-500/20 text-blue-300 border-blue-400/30"
                    >
                      {dataState.clients.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
                    <span className="text-sm text-white/80">Workers</span>
                    <Badge
                      variant="outline"
                      className="bg-purple-500/20 text-purple-300 border-purple-400/30"
                    >
                      {dataState.workers.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
                    <span className="text-sm text-white/80">Tasks</span>
                    <Badge
                      variant="outline"
                      className="bg-green-500/20 text-green-300 border-green-400/30"
                    >
                      {dataState.tasks.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {errorSummary.total === 0 ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  )}
                  <span>Validation Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {errorSummary.total === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 mx-auto text-success mb-2" />
                    <p className="text-sm font-medium text-success">
                      All Good!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No validation errors found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Issues
                      </span>
                      <Badge variant="destructive">{errorSummary.total}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Errors
                      </span>
                      <Badge variant="destructive">{errorSummary.errors}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Warnings
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-warning/10 text-warning border-warning/20"
                      >
                        {errorSummary.warnings}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/rules-builder">
                    <Settings className="w-4 h-4 mr-2" />
                    Create Business Rules
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/export">
                    <Download className="w-4 h-4 mr-2" />
                    Export Configuration
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Validation Panel */}
        {dataState.validationErrors.length > 0 && (
          <div className="mt-8">
            <ValidationPanel
              errors={dataState.validationErrors}
              onErrorClick={(error) => {
                // Switch to the appropriate tab and highlight the error
                setActiveTab(
                  error.entity === "client"
                    ? "clients"
                    : error.entity === "worker"
                      ? "workers"
                      : "tasks",
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
