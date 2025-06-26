import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  Database,
  Settings,
  Download,
  Brain,
  Zap,
  Home,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home, description: "Upload & Start" },
  {
    href: "/data-management",
    label: "Data",
    icon: Database,
    description: "Manage & Validate",
  },
  {
    href: "/rules-builder",
    label: "Rules",
    icon: Settings,
    description: "Create Rules",
  },
  {
    href: "/export",
    label: "Export",
    icon: Download,
    description: "Download Config",
  },
];

export function Navbar3D() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 3D Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg"
        style={{
          background: isScrolled
            ? "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)"
            : "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: isScrolled
            ? "0 8px 32px rgba(0,0,0,0.3)"
            : "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with 3D Effect */}
            <Link
              to="/"
              className="flex items-center space-x-3 group transition-all duration-200"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent rounded-xl flex items-center justify-center shadow-lg transition-all duration-200">
                  <Sparkles className="w-7 h-7 text-white transition-transform duration-200" />
                </div>
              </div>
              <div className="relative">
                <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                  Data Alchemist
                </h1>
                <p className="text-sm text-white/80 drop-shadow-sm">
                  AI-Powered Resource Allocation
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      to={item.href}
                      className={cn(
                        "relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 group",
                        "hover:bg-white/10 hover:shadow-md",
                        isActive &&
                          "bg-white/15 shadow-md border border-white/20",
                      )}
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)"
                          : hoveredItem === item.href
                            ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)"
                            : "transparent",
                        boxShadow: isActive
                          ? "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
                          : hoveredItem === item.href
                            ? "0 2px 8px rgba(0,0,0,0.1)"
                            : "none",
                      }}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-all duration-300",
                          isActive
                            ? "text-brand-accent drop-shadow-sm"
                            : "text-white group-hover:text-brand-accent",
                        )}
                      />
                      <span
                        className={cn(
                          "font-medium transition-all duration-300 drop-shadow-sm",
                          isActive
                            ? "text-white"
                            : "text-white group-hover:text-white",
                        )}
                      >
                        {item.label}
                      </span>

                      {/* 3D Hover tooltip */}
                      {hoveredItem === item.href && item.description && (
                        <div
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)",
                          }}
                        >
                          {item.description}
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45" />
                        </div>
                      )}

                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-brand-accent rounded-full shadow-lg animate-pulse" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* AI Status Badge */}
              <Badge
                variant="secondary"
                className="bg-green-500/30 text-green-200 border-green-400/40 shadow-sm"
              >
                <Zap className="w-3 h-3 mr-1" />
                AI Active
              </Badge>

              {/* Brain Icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer">
                <Brain className="w-5 h-5 text-purple-200" />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/20 shadow-xl animate-in slide-in-from-top-1 duration-200">
            <div className="container mx-auto px-4 py-6 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                      "hover:bg-white/15",
                      isActive && "bg-white/20",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 drop-shadow-sm",
                        isActive ? "text-brand-accent" : "text-white",
                      )}
                    />
                    <div>
                      <span
                        className={cn(
                          "font-medium drop-shadow-sm",
                          isActive ? "text-white" : "text-white",
                        )}
                      >
                        {item.label}
                      </span>
                      {item.description && (
                        <p className="text-xs text-white/80 drop-shadow-sm">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  );
}
