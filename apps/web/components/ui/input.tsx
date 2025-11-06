import {InputHTMLAttributes, forwardRef, useId} from 'react'
import {cn} from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: boolean
	helperText?: string
	label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({className, error, helperText, label, id, ...props}, ref) => {
	const generatedId = useId()
	const inputId = id || generatedId

	return (
		<div className='w-full space-y-2'>
			{label && (
				<label htmlFor={inputId} className='text-sm font-medium text-gray-700 dark:text-gray-300'>
					{label}
				</label>
			)}
			<input id={inputId} ref={ref} className={cn('flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm', 'placeholder:text-gray-400', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent', 'disabled:cursor-not-allowed disabled:opacity-50', 'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500', error && 'border-red-500 focus:ring-red-500', className)} {...props} />
			{helperText && <p className={cn('text-sm', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}>{helperText}</p>}
		</div>
	)
})

Input.displayName = 'Input'

export {Input}
