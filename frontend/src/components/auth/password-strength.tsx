"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import zxcvbn from "zxcvbn";

interface PasswordStrengthProps {
  password: string;
}

const STRENGTH_LABELS = ["非常に弱い", "弱い", "普通", "強い", "非常に強い"];
const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-blue-500",
  "bg-green-500",
];
const STRENGTH_TEXT_COLORS = [
  "text-red-600",
  "text-orange-600",
  "text-yellow-600",
  "text-blue-600",
  "text-green-600",
];

const REQUIREMENTS = [
  { label: "12文字以上", test: (p: string) => p.length >= 12 },
  { label: "大文字を含む", test: (p: string) => /[A-Z]/.test(p) },
  { label: "小文字を含む", test: (p: string) => /[a-z]/.test(p) },
  { label: "数字を含む", test: (p: string) => /[0-9]/.test(p) },
  { label: "記号を含む", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const result = useMemo(
    () => (password ? zxcvbn(password) : null),
    [password]
  );
  const score = result?.score ?? 0;

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              i <= score ? STRENGTH_COLORS[score] : "bg-muted"
            )}
          />
        ))}
      </div>

      <p className={cn("text-xs font-medium", STRENGTH_TEXT_COLORS[score])}>
        {STRENGTH_LABELS[score]}
      </p>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {REQUIREMENTS.map((req) => {
          const met = req.test(password);
          return (
            <li
              key={req.label}
              className={cn(
                "flex items-center gap-1.5 text-xs",
                met ? "text-green-600" : "text-muted-foreground"
              )}
            >
              <span className="text-sm">{met ? "✓" : "○"}</span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
