import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  center,
  light,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-[0.28em]",
            light ? "text-[#D9C6E8]" : "text-[#A7353F]"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-heading text-3xl leading-tight text-[#2F2433] sm:text-4xl lg:text-5xl",
          light && "text-[#FFFDFB]"
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-7 text-[#7B6A80] sm:text-lg",
            light && "text-[#E8D6DE]"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
