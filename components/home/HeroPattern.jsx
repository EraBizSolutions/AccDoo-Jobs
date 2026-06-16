export default function HeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 w-152.5 overflow-hidden max-md:w-50"
      aria-hidden="true"
    >
      <span className="absolute right-80 -top-2 h-7.5 w-51.25 -rotate-24 bg-main-text max-md:right-23 max-md:-top-1.75 max-md:h-4.25 max-md:w-19" />
      <span className="absolute right-77.5 top-13 h-7.5 w-23 -rotate-69 bg-white max-md:right-29.5 max-md:top-11.75 max-md:h-5 max-md:w-10.5" />
      <span className="absolute right-44.5 top-6.75 h-7.5 w-59.5 rotate-45 bg-hero-accent max-md:right-9.5 max-md:top-4 max-md:h-4.75 max-md:w-22" />
      <span className="absolute right-18.75 top-4.5 h-7.75 w-80 rotate-43 bg-main-text max-md:-right-1 max-md:top-1.75 max-md:h-5 max-md:w-31.5" />
      <span className="absolute right-16.75 -top-2.75 h-7.5 w-27 -rotate-49 bg-hero-accent max-md:right-5 max-md:-top-1 max-md:h-4.75 max-md:w-10.75" />
      <span className="absolute -right-3 top-8.25 h-7.25 w-30.5 -rotate-3 bg-hero-white max-md:-right-4.5 max-md:top-6.75 max-md:h-4.5 max-md:w-13.5" />
      <span className="absolute -bottom-5 -right-16 h-8 w-45 -rotate-14 bg-main-text max-md:-bottom-3.25 max-md:-right-11.25 max-md:h-5 max-md:w-19.5" />
    </div>
  );
}
