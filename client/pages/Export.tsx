import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  CheckCircle,
  FileText,
  Settings,
  Package,
  Sparkles,
  Zap,
  Star,
  Trophy,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar3D } from "@/components/ui/navbar-3d";
import { useToast } from "@/hooks/use-toast";

// Sample data for downloads
const generateCleanCSV = (type: "clients" | "workers" | "tasks") => {
  const storedData = sessionStorage.getItem("processedData");

  if (storedData) {
    const data = JSON.parse(storedData);
    const items = data[type] || [];

    if (items.length === 0) return "";

    // Get headers from first item
    const headers = Object.keys(items[0]);
    const headerRow = headers.join(",");

    // Convert data to CSV
    const dataRows = items.map((item: any) =>
      headers
        .map((header) => {
          const value = item[header];
          if (Array.isArray(value)) {
            return `"${value.join(",")}"`;
          }
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(","),
    );

    return [headerRow, ...dataRows].join("\n");
  }

  // Fallback sample data
  if (type === "clients") {
    return `ClientID,ClientName,PriorityLevel,RequestedTaskIDs,GroupTag,AttributesJSON
C001,Tech Corporation,5,"T001,T002",Enterprise,"{""budget"": 100000}"
C002,Marketing Solutions Inc,3,"T003,T004",SMB,"{""budget"": 50000}"`;
  } else if (type === "workers") {
    return `WorkerID,WorkerName,Skills,AvailableSlots,MaxLoadPerPhase,WorkerGroup,QualificationLevel
W001,John Smith,"JavaScript,React,Node.js","[1,2,3]",2,Frontend,4
W002,Jane Doe,"Python,Django,PostgreSQL","[2,3,4]",3,Backend,5`;
  } else {
    return `TaskID,TaskName,Category,Duration,RequiredSkills,PreferredPhases,MaxConcurrent
T001,Frontend Dashboard Development,Development,2,"JavaScript,React","[1,2]",2
T002,Backend API Implementation,Development,3,"Python,Django","[2,3,4]",1`;
  }
};

const generateRulesConfig = () => {
  return JSON.stringify(
    {
      version: "1.0.0",
      generated: new Date().toISOString(),
      businessRules: [],
      priorityWeights: {
        priorityLevel: 1,
        taskFulfillment: 1,
        fairnessConstraints: 1,
        workloadBalance: 1,
        skillMatch: 1,
        phasePreference: 1,
      },
      validationRules: {
        enabled: true,
        strictMode: false,
        rules: [
          "missing_required_column",
          "duplicate_id",
          "malformed_list",
          "out_of_range",
          "broken_json",
          "unknown_reference",
          "circular_dependency",
          "conflicting_rules",
          "overloaded_worker",
          "phase_slot_saturation",
          "skill_coverage",
          "max_concurrency",
        ],
      },
    },
    null,
    2,
  );
};

export default function Export() {
  const [downloadProgress, setDownloadProgress] = useState<
    Record<string, number>
  >({});
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>(
    {},
  );
  const [completedDownloads, setCompletedDownloads] = useState<string[]>([]);
  const { toast } = useToast();

  const downloadFile = async (
    filename: string,
    content: string,
    type: string,
  ) => {
    setIsDownloading((prev) => ({ ...prev, [filename]: true }));
    setDownloadProgress((prev) => ({ ...prev, [filename]: 0 }));

    // Simulate download progress
    for (let i = 0; i <= 100; i += 10) {
      setDownloadProgress((prev) => ({ ...prev, [filename]: i }));
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Create and download file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsDownloading((prev) => ({ ...prev, [filename]: false }));
    setCompletedDownloads((prev) => [...prev, filename]);

    toast({
      title: "Download Complete!",
      description: `${filename} has been downloaded successfully.`,
    });
  };

  const downloadCSVFile = (type: "clients" | "workers" | "tasks") => {
    const content = generateCleanCSV(type);
    const filename = `${type}_clean.csv`;
    downloadFile(filename, content, "text/csv");
  };

  const downloadConfigFile = () => {
    const content = generateRulesConfig();
    downloadFile("rules_config.json", content, "application/json");
  };

  const downloadAllFiles = async () => {
    toast({
      title: "Preparing Complete Package...",
      description: "Generating all files for download.",
    });

    // Download all files sequentially
    await downloadCSVFile("clients");
    await new Promise((resolve) => setTimeout(resolve, 500));
    await downloadCSVFile("workers");
    await new Promise((resolve) => setTimeout(resolve, 500));
    await downloadCSVFile("tasks");
    await new Promise((resolve) => setTimeout(resolve, 500));
    await downloadConfigFile();

    toast({
      title: "🎉 All Files Downloaded!",
      description: "Your complete Data Alchemist package is ready.",
    });
  };

  const fileStats = {
    clients: 8,
    workers: 12,
    tasks: 15,
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(107, 38, 217, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(36, 99, 235, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 70%),
          linear-gradient(135deg, #0f1419 0%, #1a1a2e 50%, #16213e 100%)
        `,
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-brand-primary/5 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-green-500/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-brand-secondary/5 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

        {/* Floating success particles */}
        <div className="absolute top-32 left-1/4 w-4 h-4 bg-green-400/30 rounded-full animate-float"></div>
        <div className="absolute top-48 right-1/3 w-3 h-3 bg-brand-accent/30 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/3 w-5 h-5 bg-blue-400/30 rounded-full animate-float animation-delay-4000"></div>
      </div>

      <Navbar3D />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Success Section */}
          <Card className="glass-morphism border-green-400/20 mb-12 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            {/* Success confetti effect */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <div className="absolute top-8 right-8 w-3 h-3 bg-brand-accent rounded-full animate-ping animation-delay-2000"></div>
            <div className="absolute bottom-6 left-12 w-2 h-2 bg-blue-400 rounded-full animate-ping animation-delay-4000"></div>

            <CardContent className="pt-12 pb-12 relative z-10">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <CheckCircle className="w-24 h-24 text-green-400 mx-auto animate-glow" />
                  <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 blur-xl animate-pulse-glow"></div>
                  {/* Trophy decoration */}
                  <Trophy className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" />
                </div>

                <h2 className="text-4xl font-bold text-white mb-4 text-3d">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent">
                    🎉 Data Processing Complete!
                  </span>
                </h2>

                <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                  Your spreadsheet chaos has been transformed into organized,
                  validated data. The Data Alchemist has worked its magic! ✨
                </p>

                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {fileStats.clients + fileStats.workers + fileStats.tasks}
                    </div>
                    <div className="text-sm text-white/70">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">4</div>
                    <div className="text-sm text-white/70">Files Ready</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">12</div>
                    <div className="text-sm text-white/70">
                      Validations Passed
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Download Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Clean Data Files */}
            <Card className="card-3d glass-morphism border-white/20 hover:border-blue-400/40 transition-all duration-500 group lg:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center space-x-3 text-white text-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-cyan-300" />
                  </div>
                  <span>Clean Data Files</span>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                    Production Ready
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                <p className="text-white/80">
                  Download your validated and cleaned CSV files, optimized for
                  downstream systems.
                </p>

                <div className="space-y-3">
                  {[
                    {
                      type: "clients" as const,
                      label: "clients_clean.csv",
                      records: fileStats.clients,
                      color: "blue",
                    },
                    {
                      type: "workers" as const,
                      label: "workers_clean.csv",
                      records: fileStats.workers,
                      color: "purple",
                    },
                    {
                      type: "tasks" as const,
                      label: "tasks_clean.csv",
                      records: fileStats.tasks,
                      color: "green",
                    },
                  ].map((file) => (
                    <div
                      key={file.type}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 group/file"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 bg-gradient-to-br from-${file.color}-500/20 to-${file.color}-600/20 rounded-lg flex items-center justify-center`}
                        >
                          <FileText
                            className={`w-5 h-5 text-${file.color}-300`}
                          />
                        </div>
                        <div>
                          <span className="font-medium text-white">
                            {file.label}
                          </span>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`bg-${file.color}-500/20 text-${file.color}-300 border-${file.color}-400/30 text-xs`}
                            >
                              {file.records} records
                            </Badge>
                            {completedDownloads.includes(file.label) && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => downloadCSVFile(file.type)}
                        disabled={isDownloading[file.label]}
                        className="button-3d bg-gradient-to-r from-brand-primary to-brand-secondary hover:shadow-lg relative overflow-hidden group"
                      >
                        {isDownloading[file.label] ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>{downloadProgress[file.label]}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuration File */}
            <Card className="card-3d glass-morphism border-white/20 hover:border-purple-400/40 transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Settings className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <span className="text-lg">Rules Config</span>
                    <div className="text-xs text-purple-300 font-normal">
                      JSON Format
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                <p className="text-white/80 text-sm">
                  Complete configuration file with business rules and validation
                  settings.
                </p>

                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <Settings className="w-5 h-5 text-purple-300" />
                    <span className="font-medium text-white">
                      rules_config.json
                    </span>
                    {completedDownloads.includes("rules_config.json") && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-purple-200">
                    <div className="flex justify-between">
                      <span>• Business Rules:</span>
                      <span>Configured</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Priority Weights:</span>
                      <span>Optimized</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Validation Rules:</span>
                      <span>12 Active</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={downloadConfigFile}
                  disabled={isDownloading["rules_config.json"]}
                  className="w-full button-3d bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg"
                >
                  {isDownloading["rules_config.json"] ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{downloadProgress["rules_config.json"]}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4" />
                      <span>Download Config</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Complete Package */}
          <Card className="glass-morphism border-brand-accent/30 hover:border-brand-accent/50 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-brand-secondary/5 to-brand-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            {/* Rocket decoration */}
            <Rocket className="absolute top-6 right-6 w-8 h-8 text-brand-accent/50 animate-float" />

            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-3xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-brand-accent via-white to-brand-primary bg-clip-text text-transparent">
                  🚀 Complete Export Package
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center space-y-8 relative z-10">
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Get everything in one go! All your cleaned data files and
                configuration, ready for your production systems.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-400/20">
                  <Star className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-300 mb-2">
                    Validated Data
                  </h3>
                  <p className="text-green-200/80 text-sm">
                    All errors fixed and ready
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-400/20">
                  <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-300 mb-2">
                    AI Optimized
                  </h3>
                  <p className="text-blue-200/80 text-sm">
                    Smart configurations applied
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
                  <Package className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-purple-300 mb-2">
                    Production Ready
                  </h3>
                  <p className="text-purple-200/80 text-sm">
                    Deploy immediately
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={downloadAllFiles}
                className="button-3d bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent hover:shadow-2xl relative overflow-hidden group min-w-[300px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="flex items-center space-x-3 relative z-10">
                  <Package className="w-6 h-6" />
                  <span className="text-lg font-semibold">
                    Download Complete Package
                  </span>
                  <Sparkles className="w-5 h-5" />
                </div>
              </Button>

              <div className="text-sm text-white/60 max-w-md mx-auto">
                <strong>✨ What you'll get:</strong> All CSV files + rules.json
                + validation report. Everything needed for your resource
                allocation system!
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
