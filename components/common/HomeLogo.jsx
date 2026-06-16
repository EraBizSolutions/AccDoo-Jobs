import Image from "next/image";
import Link from "next/link";

export default function HomeLogo({
  inverted = false,
  className = "h-7 max-md:h-5",
}) {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="AccDoo home">
      <Image
        src="/accdoo-logo.svg"
        alt="AccDoo"
        width={135}
        height={32}
        priority
        className={`w-auto object-contain ${className} ${
          inverted ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}
