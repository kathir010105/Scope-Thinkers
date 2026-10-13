export function FormField({ label, required, error, children, helpText, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-xs font-semibold text-[#48252a]">
          {label} {required && <span className="text-[#e06464]">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-[#e06464]">{error}</p>}
      {helpText && !error && <p className="mt-1 text-xs text-[#8b7774]">{helpText}</p>}
    </div>
  );
}

export function InputField({
  label,
  required,
  error,
  helpText,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  className = "",
  ...props
}) {
  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-12 w-full rounded-xl border border-[#eadfd8] bg-white pl-4 pr-4 text-sm text-[#48252a] outline-none transition placeholder:text-[#b99f96] focus:border-[#e06464] focus:ring-4 focus:ring-[#fbc6b9]/30 disabled:bg-[#f8f2ee] disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function SelectField({
  label,
  required,
  error,
  helpText,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled,
  className = "",
  ...props
}) {
  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`h-12 w-full rounded-xl border border-[#eadfd8] bg-white pl-4 pr-10 text-sm text-[#48252a] outline-none transition focus:border-[#e06464] focus:ring-4 focus:ring-[#fbc6b9]/30 disabled:bg-[#f8f2ee] disabled:cursor-not-allowed appearance-none ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export function TextareaField({
  label,
  required,
  error,
  helpText,
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled,
  className = "",
  ...props
}) {
  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full rounded-xl border border-[#eadfd8] bg-white p-4 text-sm text-[#48252a] outline-none transition placeholder:text-[#b99f96] focus:border-[#e06464] focus:ring-4 focus:ring-[#fbc6b9]/30 disabled:bg-[#f8f2ee] disabled:cursor-not-allowed resize-y ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function DateField({
  label,
  required,
  error,
  helpText,
  value,
  onChange,
  disabled,
  className = "",
  ...props
}) {
  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`h-12 w-full rounded-xl border border-[#eadfd8] bg-white pl-4 pr-4 text-sm text-[#48252a] outline-none transition placeholder:text-[#b99f96] focus:border-[#e06464] focus:ring-4 focus:ring-[#fbc6b9]/30 disabled:bg-[#f8f2ee] disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function NumberField({
  label,
  required,
  error,
  helpText,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  disabled,
  className = "",
  ...props
}) {
  return (
    <FormField label={label} required={required} error={error} helpText={helpText}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`h-12 w-full rounded-xl border border-[#eadfd8] bg-white pl-4 pr-4 text-sm text-[#48252a] outline-none transition placeholder:text-[#b99f96] focus:border-[#e06464] focus:ring-4 focus:ring-[#fbc6b9]/30 disabled:bg-[#f8f2ee] disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
  className = "",
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-5 w-5 rounded border-[#eadfd8] text-[#e06464] focus:ring-2 focus:ring-[#fbc6b9]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <label className="text-sm text-[#48252a] cursor-pointer">{label}</label>
    </div>
  );
}

export function FormActions({ children, className = "" }) {
  return (
    <div className={`flex justify-end gap-3 pt-2 ${className}`}>
      {children}
    </div>
  );
}

export function SubmitButton({ loading, children, className = "", ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`group flex h-12 items-center justify-center gap-2 rounded-xl bg-[#e06464] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(224,100,100,0.22)] transition hover:bg-[#d65757] hover:shadow-[0_12px_28px_rgba(224,100,100,0.28)] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? "Saving..." : children}
    </button>
  );
}

export function CancelButton({ onClick, loading, className = "", ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      Cancel
    </button>
  );
}