"use client";

import { useState } from "react";

interface PasswordInputProps {
  name: string;
  placeholder?: string;
  required?: boolean;
  showStrength?: boolean;
}

export default function PasswordInput({
  name,
  placeholder = "••••••••",
  required = true,
  showStrength = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [strength, setStrength] = useState(0);
  const [value, setValue] = useState("");

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const strengthColors = [
    "var(--text-muted)",
    "var(--accent-rose)",
    "var(--accent-coral, var(--accent-rose))",
    "var(--accent-amber)",
    "#4ade80",
    "#22c55e",
  ];

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (showStrength) setStrength(calculateStrength(e.target.value));
          }}
          className="w-full rounded-xl px-4 py-3 pr-12 text-sm transition-all duration-300 outline-none"
          style={{
            background: "var(--bg-deep)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-lavender)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(184, 140, 245, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
          style={{ color: "var(--text-muted)" }}
          tabIndex={-1}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {/* Strength indicator */}
      {showStrength && value.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  background:
                    level <= strength
                      ? strengthColors[strength]
                      : "var(--border-subtle)",
                }}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: strengthColors[strength] }}>
            {strengthLabels[strength]}
          </p>
        </div>
      )}
    </div>
  );
}
