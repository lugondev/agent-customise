'use client'

import {Moon, Sun} from 'lucide-react'
import {useTheme} from 'next-themes'
import {Button} from '@/components/ui/button'

export function ThemeToggle() {
	const {theme, setTheme} = useTheme()

	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light')
	}

	return (
		<Button variant='ghost' size='sm' onClick={toggleTheme} className='relative h-9 w-9 rounded-xl hover:bg-accent/80 transition-all duration-300 group hover:scale-105'>
			<div className='relative w-full h-full flex items-center justify-center'>
				<Sun className='h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 group-hover:scale-110' />
				<Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 group-hover:scale-110' />
			</div>
			<span className='sr-only'>Toggle theme</span>

			{/* Ripple effect */}
			<div className='absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-0 group-hover:scale-100' />
		</Button>
	)
}
