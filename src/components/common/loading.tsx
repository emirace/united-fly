type Props = {
  color?: string;
  size?: "sm" | "md" | "lg";
};

const Loading = ({ size = "md", color }: Props) => {
  const sizeClass =
    size === "sm" ? "h-6 w-6" : size === "lg" ? "h-20 w-20" : "h-10 w-10";

  return (
    <div
      className={`animate-spin rounded-full border-t-2 ${sizeClass} ${
        color ?? "border-accent"
      }`}
    />
  );
};

export default Loading;
