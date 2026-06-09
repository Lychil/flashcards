import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

interface FormFieldProps {
  label: string
  hint?: string
  children: ReactNode
}

export function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-text-primary mb-1.5">
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-[12px] text-text-tertiary leading-relaxed">{hint}</p>
      )}
    </div>
  )
}

const inputClass = [
  'w-full rounded-xl border border-border bg-white px-3.5 py-2.5',
  'text-[14px] text-text-primary placeholder:text-text-tertiary',
  'hover:border-text-tertiary/40',
  'focus:outline-none focus:border-border',
].join(' ')

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={[inputClass, 'min-h-[96px] resize-y'].join(' ')}
      {...props}
    />
  )
}
