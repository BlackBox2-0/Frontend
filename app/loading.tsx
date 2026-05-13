export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="flex flex-col items-center">
        <img
          src="/logo.png"
          alt="BlackBooks"
          className="size-[72px] object-contain drop-shadow-[0_0_20px_rgba(123,47,255,0.8)]"
        />
        <div className="mt-4 font-heading text-xl font-extrabold tracking-[0.08em]">
          <span className="text-white">BLACK</span>
          <span className="text-[var(--glow-purple)]">BOOKS</span>
        </div>
        <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[var(--glow-purple)] via-[var(--glow-violet)] to-[var(--glow-cyan)] shadow-[0_0_18px_rgba(123,47,255,0.5)]" />
        </div>
      </div>
    </div>
  );
}
