type SectionHeaderProps = {
  title: string
  description: string
  // Shown when a section is editable but not yet displayed on the public site.
  notice?: string
}

export default function SectionHeader({ title, description, notice }: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-[6px]">
      <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[var(--admin-text)]">{title}</h1>
      <p className="max-w-[720px] text-[15px] leading-[1.5] text-[var(--admin-muted)]">{description}</p>
      {notice && (
        <p className="mt-[6px] max-w-[720px] rounded-[12px] border border-[#f3dfb6] bg-[#fdf8ee] px-[14px] py-[10px] text-[14px] text-[#7a5b22]">
          {notice}
        </p>
      )}
    </header>
  )
}
