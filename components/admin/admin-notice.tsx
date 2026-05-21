type AdminNoticeProps = {
  title: string;
  text: string;
};

export function AdminNotice({ title, text }: AdminNoticeProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#D9C6E8] bg-[#F7F1FA]/70 p-8 text-center">
      <p className="font-heading text-3xl text-[#2F2433]">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[#7B6A80]">
        {text}
      </p>
    </div>
  );
}
