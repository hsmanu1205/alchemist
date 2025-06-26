import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  Database,
  Settings,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  Brain,
  Target,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar3D } from "@/components/ui/navbar-3d";
import { FileUploadState, UploadResponse } from "@shared/types";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    uploadProgress: 0,
    isUploading: false,
  });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (
    files: File[],
    type: "clients" | "workers" | "tasks",
  ) => {
    setUploadState((prev) => ({
      ...prev,
      [`${type}File`]: files[0],
    }));
  };

  const handleFileRemove = (type: "clients" | "workers" | "tasks") => {
    setUploadState((prev) => ({
      ...prev,
      [`${type}File`]: undefined,
    }));
  };

  const handleUploadAndProcess = async () => {
    setUploadState((prev) => ({ ...prev, isUploading: true }));

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadState((prev) => ({ ...prev, uploadProgress: i }));
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Call the API to process files
      const response = await fetch("/api/upload-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // In a real implementation, this would include the file data
          demo: true,
        }),
      });

      const result: UploadResponse = await response.json();

      if (result.success) {
        // Store the processed data in sessionStorage for the next page
        sessionStorage.setItem("processedData", JSON.stringify(result.data));
        sessionStorage.setItem(
          "validationErrors",
          JSON.stringify(result.errors || []),
        );

        toast({
          title: "Files processed successfully!",
          description: `Loaded ${result.data?.clients.length || 0} clients, ${result.data?.workers.length || 0} workers, and ${result.data?.tasks.length || 0} tasks.`,
        });

        // Navigate to data management page
        navigate("/data-management");
      } else {
        throw new Error(result.message || "Failed to process files");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          "There was an error processing your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        uploadProgress: 0,
      }));
    }
  };

  const handleDemoMode = () => {
    setIsDemoMode(true);
    setUploadState({
      clientsFile: new File(["demo"], "clients.csv"),
      workersFile: new File(["demo"], "workers.csv"),
      tasksFile: new File(["demo"], "tasks.csv"),
      uploadProgress: 0,
      isUploading: false,
    });
  };

  const canProceed =
    (uploadState.clientsFile &&
      uploadState.workersFile &&
      uploadState.tasksFile) ||
    isDemoMode;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% 80%, rgba(107, 38, 217, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(36, 99, 235, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(284, 100, 84, 0.2) 0%, transparent 50%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)
        `,
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-primary/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-brand-secondary/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-accent/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <Navbar3D />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12 relative">
          {/* Floating 3D Elements */}
          <div className="absolute -top-20 left-1/4 w-20 h-20 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full animate-float animation-delay-2000 filter blur-sm"></div>
          <div className="absolute -top-10 right-1/3 w-16 h-16 bg-gradient-to-br from-brand-accent/20 to-brand-primary/20 rounded-full animate-float filter blur-sm"></div>
          <div className="absolute top-10 left-1/6 w-12 h-12 bg-gradient-to-br from-brand-secondary/20 to-brand-accent/20 rounded-full animate-float animation-delay-4000 filter blur-sm"></div>

          <h2 className="text-6xl font-bold text-white mb-6 text-3d relative">
            <span className="bg-gradient-to-r from-white via-brand-accent to-white bg-clip-text text-transparent">
              Forge Your Own AI
            </span>
            <br />
            <span className="bg-gradient-to-r from-brand-accent via-white to-brand-primary bg-clip-text text-transparent">
              Resource‑Allocation Configurator
            </span>
            {/* Glowing backdrop */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 via-transparent to-brand-secondary/20 blur-3xl -z-10 scale-110"></div>
          </h2>

          <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed relative">
            <span className="bg-gradient-to-r from-white/90 via-white to-white/90 bg-clip-text text-transparent">
              Transform chaotic spreadsheets into organized, validated data with
              AI-powered insights. Upload your CSV or XLSX files, let our AI
              clean and validate them, create business rules in plain English,
              and export production-ready configurations.
            </span>
          </p>

          {/* 3D Orb decoration */}
          <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-brand-primary/10 via-brand-secondary/10 to-brand-accent/10 rounded-full animate-pulse-glow filter blur-3xl"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="card-3d glass-morphism border-white/20 hover:border-white/40 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-glow">
                <Database className="w-8 h-8 text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
              </div>
              <CardTitle className="text-white text-xl group-hover:text-brand-accent transition-colors duration-300">
                Smart Data Ingestion
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-white/80 group-hover:text-white/90 transition-colors duration-300">
                AI-enabled parser that maps wrongly named headers and rearranged
                columns to the right data points automatically.
              </p>
            </CardContent>
            {/* 3D corner accent */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-brand-primary/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Card>

          <Card className="card-3d glass-morphism border-white/20 hover:border-white/40 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-glow">
                <Brain className="w-8 h-8 text-purple-300 group-hover:text-purple-200 transition-colors duration-300 animate-rotate-y" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
              </div>
              <CardTitle className="text-white text-xl group-hover:text-brand-accent transition-colors duration-300">
                Natural Language AI
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-white/80 group-hover:text-white/90 transition-colors duration-300">
                Search and modify data using plain English. Create business
                rules by describing them naturally.
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-brand-secondary/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Card>

          <Card className="card-3d glass-morphism border-white/20 hover:border-white/40 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 animate-glow">
                <Target className="w-8 h-8 text-green-300 group-hover:text-green-200 transition-colors duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
              </div>
              <CardTitle className="text-white text-xl group-hover:text-brand-accent transition-colors duration-300">
                Smart Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-white/80 group-hover:text-white/90 transition-colors duration-300">
                Comprehensive validation with AI-powered error detection,
                suggestions, and one-click fixes.
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-brand-accent/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="glass-morphism border-white/30 shadow-2xl relative overflow-hidden group">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          {/* Floating particles */}
          <div className="absolute top-10 left-10 w-2 h-2 bg-brand-accent/50 rounded-full animate-float"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-brand-primary/50 rounded-full animate-float animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-brand-secondary/50 rounded-full animate-float animation-delay-4000"></div>

          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-4xl font-bold text-white mb-4 text-3d">
              <span className="bg-gradient-to-r from-white via-brand-accent to-white bg-clip-text text-transparent">
                Upload Your Data Files
              </span>
              {/* Glowing underline */}
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent mx-auto mt-2 rounded-full"></div>
            </CardTitle>
            <p className="text-white/80 text-lg">
              Start by uploading your client, worker, and task data files. We
              support CSV and Excel formats.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Sample Data Download */}
            <div className="text-center p-4 bg-accent/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Don't have data files? Download our sample files to get started:
              </p>
              <div className="flex items-center justify-center space-x-4">
                <a
                  href="/samples/clients.csv"
                  download
                  className="text-primary hover:underline text-sm"
                >
                  📄 clients.csv
                </a>
                <a
                  href="/samples/workers.csv"
                  download
                  className="text-primary hover:underline text-sm"
                >
                  📄 workers.csv
                </a>
                <a
                  href="/samples/tasks.csv"
                  download
                  className="text-primary hover:underline text-sm"
                >
                  📄 tasks.csv
                </a>
              </div>
            </div>

            {/* File Upload Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <FileUpload
                title="Clients Data"
                description="Upload your clients.csv or .xlsx file"
                files={uploadState.clientsFile ? [uploadState.clientsFile] : []}
                onFileSelect={(files) => handleFileSelect(files, "clients")}
                onFileRemove={() => handleFileRemove("clients")}
                disabled={uploadState.isUploading}
              />

              <FileUpload
                title="Workers Data"
                description="Upload your workers.csv or .xlsx file"
                files={uploadState.workersFile ? [uploadState.workersFile] : []}
                onFileSelect={(files) => handleFileSelect(files, "workers")}
                onFileRemove={() => handleFileRemove("workers")}
                disabled={uploadState.isUploading}
              />

              <FileUpload
                title="Tasks Data"
                description="Upload your tasks.csv or .xlsx file"
                files={uploadState.tasksFile ? [uploadState.tasksFile] : []}
                onFileSelect={(files) => handleFileSelect(files, "tasks")}
                onFileRemove={() => handleFileRemove("tasks")}
                disabled={uploadState.isUploading}
              />
            </div>

            {/* Progress Indicator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  Upload Progress
                </span>
                <span className="text-muted-foreground">
                  {Object.values(uploadState).filter(Boolean).length - 2}/3
                  files uploaded
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { key: "clientsFile", label: "Clients Data" },
                  { key: "workersFile", label: "Workers Data" },
                  { key: "tasksFile", label: "Tasks Data" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-3">
                    <CheckCircle
                      className={`w-5 h-5 ${
                        uploadState[key as keyof FileUploadState]
                          ? "text-success"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        uploadState[key as keyof FileUploadState]
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
              {!isDemoMode && !canProceed && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleDemoMode}
                  className="button-3d border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10 hover:border-brand-accent/60 hover:text-white transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/0 via-brand-accent/20 to-brand-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                  <span className="relative z-10">
                    Try Demo with Sample Data
                  </span>
                </Button>
              )}

              <Button
                size="lg"
                disabled={!canProceed || uploadState.isUploading}
                onClick={handleUploadAndProcess}
                className="button-3d bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-size-200 hover:bg-pos-100 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group min-w-[280px]"
                style={{
                  backgroundSize: "200% 100%",
                  backgroundPosition: "0% 0%",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!uploadState.isUploading && canProceed) {
                    e.currentTarget.style.backgroundPosition = "100% 0%";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = "0% 0%";
                }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                {uploadState.isUploading ? (
                  <span className="flex items-center space-x-3 relative z-10">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-semibold">
                      Processing... {uploadState.uploadProgress}%
                    </span>
                  </span>
                ) : canProceed ? (
                  <span className="flex items-center space-x-3 relative z-10">
                    <span className="font-semibold text-lg">
                      Process & Validate Data
                    </span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                ) : (
                  <span className="flex items-center space-x-3 relative z-10">
                    <Upload className="w-5 h-5" />
                    <span className="font-semibold">
                      Upload Files to Continue
                    </span>
                  </span>
                )}

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 scale-110"></div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: 1,
              title: "Upload Data",
              description:
                "Upload CSV/XLSX files for clients, workers, and tasks",
              icon: Upload,
              active: true,
              color: "from-blue-500 to-cyan-500",
              bgColor: "from-blue-500/10 to-cyan-500/10",
            },
            {
              step: 2,
              title: "Validate & Edit",
              description:
                "AI-powered validation with inline editing capabilities",
              icon: Database,
              active: canProceed,
              color: "from-purple-500 to-pink-500",
              bgColor: "from-purple-500/10 to-pink-500/10",
            },
            {
              step: 3,
              title: "Create Rules",
              description: "Build business rules using natural language",
              icon: Settings,
              active: false,
              color: "from-green-500 to-emerald-500",
              bgColor: "from-green-500/10 to-emerald-500/10",
            },
            {
              step: 4,
              title: "Export Config",
              description: "Download cleaned data and rules.json file",
              icon: Download,
              active: false,
              color: "from-orange-500 to-red-500",
              bgColor: "from-orange-500/10 to-red-500/10",
            },
          ].map((item, index) => (
            <Card
              key={item.step}
              className={`card-3d glass-morphism border-white/20 hover:border-white/40 transition-all duration-500 group relative overflow-hidden ${
                item.active ? "ring-2 ring-brand-accent/50 scale-105" : ""
              }`}
            >
              {/* Animated background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              ></div>

              {/* Step connector line */}
              {index < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/30 to-transparent"></div>
              )}

              <CardContent className="p-8 text-center relative z-10">
                <div
                  className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                    item.active
                      ? `bg-gradient-to-br ${item.color} animate-glow`
                      : "bg-white/20 group-hover:bg-white/30"
                  }`}
                >
                  <item.icon
                    className={`w-8 h-8 transition-all duration-300 ${
                      item.active
                        ? "text-white"
                        : "text-white/70 group-hover:text-white"
                    }`}
                  />

                  {/* Glow effect for active items */}
                  {item.active && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500 scale-150`}
                    ></div>
                  )}
                </div>

                <div className="mb-4">
                  <Badge
                    variant={item.active ? "default" : "secondary"}
                    className={`transition-all duration-300 ${
                      item.active
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : "bg-white/20 text-white/80 group-hover:bg-white/30 group-hover:text-white"
                    }`}
                  >
                    Step {item.step}
                  </Badge>
                </div>

                <h3
                  className={`text-xl font-bold mb-3 transition-all duration-300 ${
                    item.active
                      ? "text-white"
                      : "text-white/90 group-hover:text-white"
                  }`}
                >
                  {item.title}
                </h3>

                <p
                  className={`text-sm leading-relaxed transition-all duration-300 ${
                    item.active
                      ? "text-white/90"
                      : "text-white/70 group-hover:text-white/85"
                  }`}
                >
                  {item.description}
                </p>

                {/* Active pulse indicator */}
                {item.active && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-brand-accent rounded-full animate-ping"></div>
                )}

                {/* Corner decoration */}
                <div
                  className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${item.bgColor} rounded-bl-full opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
                ></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
