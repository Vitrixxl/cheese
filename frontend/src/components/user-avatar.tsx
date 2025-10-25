import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
}: VariantProps<typeof avatarVariants> & {
  url?: string | null;
  name: string;
}) => {
  const parts = name.split(" ");
  let displayLetters;
  if (parts.length > 0) {
    displayLetters = parts[0][0] + parts[1][0];
  } else {
    displayLetters = parts.slice(0, 2);
  }

  return (
    <Avatar className={avatarVariants({ size })}>
      <AvatarImage
        className={avatarVariants({ size })}
        src={url ?? undefined}
      />
      <AvatarFallback className={avatarVariants({ size })}>
        {displayLetters}
      </AvatarFallback>
    </Avatar>
  );
};
