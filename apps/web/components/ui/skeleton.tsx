import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle'
  animated?: boolean
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rect', animated = true, ...props }, ref) => {
    const baseClasses = 'bg-gray-200 dark:bg-gray-700'
    
    const variantClasses = {
      text: 'h-4 w-full rounded',
      rect: 'rounded-lg',
      circle: 'rounded-full'
    }
    
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      animated && 'animate-pulse',
      className
    )
    
    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }