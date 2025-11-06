'use client'

import {useState, useEffect} from 'react'
import {McpServer} from '@agent/shared'
import {getAllMcpServers, getEnabledMcpServers} from '@/lib/api/mcp-api'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {Skeleton} from '@/components/ui/skeleton'
import {Shield, ChevronDown, ChevronUp, Circle} from 'lucide-react'
import {cn} from '@/lib/utils'

interface McpStats {
	total: number
	enabled: number
	disabled: number
}

export default function McpStatusWidget() {
	const [stats, setStats] = useState<McpStats>({
		total: 0,
		enabled: 0,
		disabled: 0,
	})
	const [servers, setServers] = useState<McpServer[]>([])
	const [loading, setLoading] = useState(true)
	const [showDetails, setShowDetails] = useState(false)

	useEffect(() => {
		loadStats()
		const interval = setInterval(loadStats, 30000)
		return () => clearInterval(interval)
	}, [])

	const loadStats = async () => {
		try {
			const [allServers, enabledServers] = await Promise.all([getAllMcpServers(), getEnabledMcpServers()])

			setServers(allServers)
			setStats({
				total: allServers.length,
				enabled: enabledServers.length,
				disabled: allServers.length - enabledServers.length,
			})
		} catch (error) {
			console.error('Failed to load MCP stats:', error)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div className='space-y-3'>
				<Skeleton className='h-4 w-full' />
				<Skeleton className='h-4 w-3/4' />
			</div>
		)
	}

	const isOnline = stats.enabled > 0

	return (
		<div className='space-y-4'>
			<Button variant='ghost' className='w-full justify-between p-0 h-auto hover:bg-transparent' onClick={() => setShowDetails(!showDetails)}>
				<div className='flex items-center gap-2'>
					<Shield className='h-4 w-4 text-muted-foreground' />
					<span className='text-sm font-medium'>MCP Servers</span>
				</div>
				<div className='flex items-center gap-2'>
					<Badge variant={isOnline ? 'success' : 'secondary'} className='gap-1'>
						<Circle className={cn('h-2 w-2 fill-current', isOnline && 'animate-pulse')} />
						{isOnline ? 'Online' : 'Offline'}
					</Badge>
					{showDetails ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
				</div>
			</Button>

			{showDetails && (
				<div className='space-y-3'>
					<div className='grid grid-cols-3 gap-3 text-center'>
						<div className='space-y-1'>
							<p className='text-2xl font-bold'>{stats.total}</p>
							<p className='text-xs text-muted-foreground'>Total</p>
						</div>
						<div className='space-y-1'>
							<p className='text-2xl font-bold text-green-600 dark:text-green-400'>{stats.enabled}</p>
							<p className='text-xs text-muted-foreground'>Enabled</p>
						</div>
						<div className='space-y-1'>
							<p className='text-2xl font-bold text-muted-foreground'>{stats.disabled}</p>
							<p className='text-xs text-muted-foreground'>Disabled</p>
						</div>
					</div>

					<div className='space-y-2 max-h-40 overflow-y-auto'>
						{servers.map((server) => (
							<div key={server.id} className='flex items-center justify-between rounded-lg border p-2'>
								<div className='flex items-center gap-2'>
									<Circle className={cn('h-2 w-2 fill-current', server.enabled ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground')} />
									<span className='text-sm'>{server.name}</span>
								</div>
								<Badge variant={server.enabled ? 'success' : 'secondary'} className='text-xs'>
									{server.enabled ? 'Active' : 'Inactive'}
								</Badge>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
