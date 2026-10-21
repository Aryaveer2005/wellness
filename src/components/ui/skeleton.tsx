import { cn } from "cn"
import styles from "./skeleton.module.css"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(styles.shimmer, "rounded-2xl", className)}
      {...props}
    />
  )
}

export { Skeleton }
