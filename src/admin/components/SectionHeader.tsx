type SectionHeaderProps = {
  title: string
  description: string
  // Shown when a section is editable but not yet displayed on the public site.
  notice?: string
}

export default function SectionHeader({ title, description, notice }: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-[8px]">
      <h1 className="font-['Noto_Serif:Bold'] text-[28px] font-bold text-[#091e39]">{title}</h1>
      <p className="max-w-[720px] text-[15px] text-[#555]">{description}</p>
      {notice && (
        <p className="max-w-[720px] rounded-[8px] border border-[#c7994b]/40 bg-[#c7994b]/10 px-[12px] py-[8px] text-[14px] text-[#6b4f1d]">
          {notice}
        </p>
      )}
    </header>
  )
}
