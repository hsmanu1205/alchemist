import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Settings, Sparkles, Brain, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar3D } from "@/components/ui/navbar-3d";

export default function RulesBuilder() {
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
      <Navbar3D />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Coming Soon Card */}
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                AI-Powered Rules Builder
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Create sophisticated business rules using natural language. Our
                AI will translate your requirements into precise configurations
                automatically.
              </p>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-accent/50 rounded-lg">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">
                    Natural Language Rules
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    "Tasks T12 and T14 must run together" → Co-run rule
                  </p>
                </div>
                <div className="p-6 bg-accent/50 rounded-lg">
                  <Plus className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">
                    Smart Recommendations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    AI suggests rules based on your data patterns
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-8">
                <p className="text-sm text-muted-foreground">
                  <strong>This feature is currently under development.</strong>{" "}
                  In the meantime, you can continue to the export page to
                  download your validated data.
                </p>
              </div>

              <Button size="lg" asChild>
                <Link to="/export">Continue to Export</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
