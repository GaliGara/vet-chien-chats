type AdminNoticeProps = {
  title: string;
  text: string;
};

export function AdminNotice({ title, text }: AdminNoticeProps) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-[#D9C6E8] bg-[#F7F1FA]/70 p-5 text-center sm:p-6">
      <p className="font-heading text-2xl text-[#2F2433] sm:text-3xl">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#7B6A80]">
        {text}
      </p>
    </div>
  );
}
