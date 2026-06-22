export default function HeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 w-170 overflow-hidden max-md:w-50"
      aria-hidden="true"
    >
      <span className="absolute right-92 -top-1 h-8.5 w-57 -rotate-24 bg-main-text max-md:right-23 max-md:-top-1.75 max-md:h-4.25 max-md:w-19" />
      <span className="absolute right-86 top-19 h-8.5 w-26 -rotate-69 bg-white max-md:right-29.5 max-md:top-11.75 max-md:h-5 max-md:w-10.5" />
      <span className="absolute right-51 top-3.5 h-8.5 w-60 rotate-45 bg-hero-accent max-md:right-9.5 max-md:top-4 max-md:h-4.75 max-md:w-22" />
      <span className="absolute right-13 top-1 h-9 w-88 rotate-43 bg-main-text max-md:-right-1 max-md:top-1.75 max-md:h-5 max-md:w-31.5" />
      <span className="absolute right-16 -top-6 h-8.5 w-30 -rotate-49 bg-hero-accent max-md:right-5 max-md:-top-1 max-md:h-4.75 max-md:w-10.75" />
      <span className="absolute -right-6 top-7 h-8 w-40 -rotate-3 bg-hero-white max-md:-right-4.5 max-md:top-6.75 max-md:h-4.5 max-md:w-13.5" />
      <span className="absolute -bottom-7 -right-16 h-9 w-58 -rotate-14 bg-main-text max-md:-bottom-3.25 max-md:-right-11.25 max-md:h-5 max-md:w-19.5" />
    </div>
  );
}
