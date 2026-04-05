"use client";

interface AuthInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  prefix?: string;
}

export default function AuthInput({
  name,
  type = "text",
  placeholder,
  required = true,
  prefix,
}: AuthInputProps) {
  return (
    <div className="relative">
      {prefix && (
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          {prefix}
        </span>
      )}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl ${prefix ? "pl-9" : "px-4"} pr-4 py-3 text-sm transition-all duration-300 outline-none`}
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
    </div>
  );
}
