export default function ProfileAvatar({ user }) {
  const firstLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ||
    user?.email?.trim()?.charAt(0)?.toUpperCase() ||
    "K";

  return (
    <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-avatar-surface text-[12px] font-semibold text-accdoo-primary">
      {firstLetter}
    </span>
  );
}
