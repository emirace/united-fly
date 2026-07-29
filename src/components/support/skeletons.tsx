export const SkeletonConversationLoading: React.FC = () => (
  <div className="flex animate-pulse gap-3 p-4">
    <div className="size-11 rounded-full bg-white/10" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="h-3 w-36 rounded bg-white/8" />
    </div>
    <div className="space-y-2 text-right">
      <div className="ml-auto h-3 w-16 rounded bg-white/8" />
      <div className="ml-auto size-5 rounded-full bg-white/10" />
    </div>
  </div>
);

export const SkeletonMessageLoading: React.FC = () => (
  <div className="mb-4 animate-pulse space-y-4">
    <div className="flex gap-2">
      <div className="size-8 shrink-0 rounded-full bg-white/10" />
      <div className="h-14 w-52 rounded-xl bg-white/8" />
    </div>
    <div className="flex justify-end">
      <div className="h-12 w-44 rounded-xl bg-accent/20" />
    </div>
  </div>
);
