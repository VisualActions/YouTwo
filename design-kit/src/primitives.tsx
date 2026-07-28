import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "./internal/format.js";
import { FileVideoIcon } from "./internal/icons.js";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "blue"
  | "outline"
  | "danger"
  | "ghost-danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight. `primary` is the white pill used for the page's main action. */
  variant?: ButtonVariant;
  /** Control height: `sm` 32px, `md` 36px (default), `lg` 44px. */
  size?: "sm" | "md" | "lg";
  /** Stretch to the full width of the parent. */
  block?: boolean;
  /** Icon rendered before the label. */
  startIcon?: ReactNode;
  children?: ReactNode;
}

/**
 * The pill button used across YouTwo. `primary` is the white call-to-action,
 * `secondary` the neutral gray pill, `blue` the sign-in accent.
 */
export function Button({
  variant = "primary",
  size = "md",
  block,
  startIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cx("yt-btn", `yt-btn--${variant}`, size !== "md" && `yt-btn--${size}`, block && "yt-btn--block", className)}
      {...rest}
    >
      {startIcon}
      {children}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The icon to render. Required — this control has no label. */
  icon: ReactNode;
  /** Accessible name, applied as aria-label and title. */
  label: string;
  /** `round` for topbar actions, `boxed` for the square gray buttons in Studio panels. */
  shape?: "round" | "boxed";
}

/** Icon-only circular (or boxed) button — topbar actions, copy/reveal controls. */
export function IconButton({ icon, label, shape = "round", className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx("yt-icon-btn", shape === "boxed" && "yt-icon-btn--boxed", className)}
      {...rest}
    >
      {icon}
    </button>
  );
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label rendered above the control. */
  label?: string;
  /** Helper text under the control. */
  hint?: string;
  /** Error message; also switches the border to the danger color. */
  error?: string;
  /** Static prefix rendered in an attached gray box, e.g. `@` for handles. */
  prefix?: string;
}

/** Single-line text input with optional label, hint, error, and static prefix. */
export function TextField({ label, hint, error, prefix, className, id, ...rest }: TextFieldProps) {
  const input = (
    <input
      id={id}
      className={cx("yt-input", error && "yt-input--invalid", className)}
      {...rest}
    />
  );
  return (
    <div className="yt-field">
      {label && (
        <label className="yt-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      {prefix ? (
        <div className="yt-input-group">
          <span className="yt-input-group__prefix">{prefix}</span>
          {input}
        </div>
      ) : (
        input
      )}
      {hint && !error && <p className="yt-field__hint">{hint}</p>}
      {error && <p className="yt-field__error">{error}</p>}
    </div>
  );
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

/** Multi-line input for descriptions and channel bios. */
export function TextArea({ label, hint, error, className, id, rows = 4, ...rest }: TextAreaProps) {
  return (
    <div className="yt-field">
      {label && (
        <label className="yt-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea id={id} rows={rows} className={cx("yt-textarea", className)} {...rest} />
      {hint && !error && <p className="yt-field__hint">{hint}</p>}
      {error && <p className="yt-field__error">{error}</p>}
    </div>
  );
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  /** Options as `{value, label}` pairs. */
  options: Array<{ value: string; label: string }>;
}

/** Dropdown used for visibility and other small enum choices. */
export function SelectField({ label, hint, options, className, id, ...rest }: SelectFieldProps) {
  return (
    <div className="yt-field">
      {label && (
        <label className="yt-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className={cx("yt-select", className)} {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="yt-field__hint">{hint}</p>}
    </div>
  );
}

export interface FileDropzoneProps {
  /** Name of the chosen file, if one has been picked. */
  fileName?: string;
  /** Human-readable file size, e.g. "24.3 MB". */
  fileSize?: string;
  /** Prompt shown when no file is selected. */
  placeholder?: string;
  /** Highlight the border, e.g. while a file is dragged over. */
  active?: boolean;
  onClick?: () => void;
}

/** Dashed drop target for video uploads in Studio. */
export function FileDropzone({
  fileName,
  fileSize,
  placeholder = "Click to choose a video file",
  active,
  onClick,
}: FileDropzoneProps) {
  return (
    <button type="button" className={cx("yt-dropzone", active && "yt-dropzone--active")} onClick={onClick}>
      <FileVideoIcon size={40} />
      {fileName ? (
        <span style={{ color: "var(--yt-text)" }}>
          {fileName}
          {fileSize && <span style={{ color: "var(--yt-text-secondary)" }}> ({fileSize})</span>}
        </span>
      ) : (
        <span>{placeholder}</span>
      )}
    </button>
  );
}
