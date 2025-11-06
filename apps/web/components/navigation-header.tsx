'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Bot, Home, Settings, Activity} from 'lucide-react'
import {ThemeToggle} from './theme-toggle'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils'

const navigation = [
	{
		name: 'Chat',
		href: '/',
		icon: Home,
	},
	{
		name: 'MCP Servers',
		href: '/mcp',
		icon: Settings,
	},
	{
		name: 'Status',
		href: '#',
		icon: Activity,
	},
]

export function NavigationHeader() {
	const pathname = usePathname()

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
			<div className='container flex h-16 items-center justify-between px-4'>
				<div className='flex items-center gap-6'>
					<Link href='/' className='flex items-center space-x-2'>
						<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary'>
							<Bot className='h-5 w-5 text-primary-foreground' />
						</div>
						<span className='text-lg font-semibold'>AI Agent System</span>
					</Link>

					<nav className='hidden md:flex items-center gap-1'>
						{navigation.map((item) => {
							const Icon = item.icon
							const isActive = pathname === item.href
							return (
								<Button key={item.name} variant={isActive ? 'secondary' : 'ghost'} size='sm' asChild className={cn('gap-2', isActive && 'bg-secondary')}>
									<Link href={item.href}>
										<Icon className='h-4 w-4' />
										<span>{item.name}</span>
									</Link>
								</Button>
							)
						})}
					</nav>
				</div>

				<div className='flex items-center gap-2'>
					<ThemeToggle />
				</div>
			</div>
		</header>
	)
}
