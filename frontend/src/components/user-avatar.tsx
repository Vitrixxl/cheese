import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

const avatarVariants = cva("flex justify-center items-center", {
  variants: {
    size: {
      lg: "size-10 !text-lg",
      md: "size-8 !text-lg",
      sm: "size-6 !text-xs",
    },
  },

  defaultVariants: {
    size: "md",
  },
});
export const UserAvatar = ({
  size,
  url,
  name,
  className,
  innerClassName,
}: VariantProps<typeof avatarVariants> & {
  url?: string | null;
  name: string;
  className?: string;
  innerClassName?: string;
}) => {
  const parts = name.split(" ");
  let displayLetters;
  if (parts.length > 0) {
    displayLetters = parts[0][0] + parts[1][0];
  } else {
    displayLetters = parts.slice(0, 2);
  }

  return (
    <Avatar className={cn(avatarVariants({ size }), className)}>
      <AvatarImage src={url ?? undefined} className={cn(innerClassName)} />
      <AvatarFallback className={cn(innerClassName)}>
        {displayLetters}
      </AvatarFallback>
    </Avatar>
  );
};

export const UserAvatarSkeleton = ({
  size,
}: VariantProps<typeof avatarVariants>) => {
  return <Skeleton className={cn(avatarVariants({ size }), "rounded-full")} />;
};
