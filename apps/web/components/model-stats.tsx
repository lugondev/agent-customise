'use client'

import {useState, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {Skeleton} from '@/components/ui/skeleton'
import {RotateCcw, Activity, CheckCircle2, XCircle} from 'lucide-react'

interface ModelStats {
	total: number
	completed: number
	failed: number
}

interface ModelRun {
	id: string
	model: string
	status: 'completed' | 'failed'
	timestamp: string
	duration: number
}

export default function ModelStats() {
	const [stats, setStats] = useState<ModelStats>({
		total: 0,
		completed: 0,
		failed: 0,
	})
	const [, setRecentRuns] = useState<ModelRun[]>([])
	const [loading, setLoading] = useState(true)
	const [checkingHealth, setCheckingHealth] = useState(false)

	useEffect(() => {
		loadStats()
	}, [])

	const loadStats = async () => {
		try {
			// Simulate API call with mock data
			await new Promise((resolve) => setTimeout(resolve, 1000))

			const mockRuns: ModelRun[] = [
				{
					id: '1',
					model: 'gpt-4o',
					status: 'completed',
					timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
					duration: 2.3,
				},
				{
					id: '2',
					model: 'claude-3-haiku',
					status: 'completed',
					timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
					duration: 1.8,
				},
				{
					id: '3',
					model: 'deepseek-chat',
					status: 'failed',
					timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
					duration: 0.5,
				},
			]

			const completed = mockRuns.filter((r) => r.status === 'completed').length
			const failed = mockRuns.filter((r) => r.status === 'failed').length

			setStats({
				total: mockRuns.length,
				completed,
				failed,
			})
			setRecentRuns(mockRuns)
		} catch (error) {
			console.error('Failed to load model stats:', error)
		} finally {
			setLoading(false)
		}
	}

	const checkHealth = async () => {
		setCheckingHealth(true)
		try {
			await loadStats()
		} finally {
			setCheckingHealth(false)
		}
	}

	if (loading) {
		return (
			<div className='space-y-3'>
				<Skeleton className='h-4 w-full' />
				<Skeleton className='h-4 w-3/4' />
				<Skeleton className='h-4 w-1/2' />
			</div>
		)
	}

	const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Activity className='h-4 w-4 text-muted-foreground' />
					<span className='text-sm font-medium'>Activity</span>
				</div>
				<Button variant='ghost' size='icon' onClick={checkHealth} disabled={checkingHealth}>
					<RotateCcw className={`h-4 w-4 ${checkingHealth ? 'animate-spin' : ''}`} />
				</Button>
			</div>

			<div className='grid grid-cols-3 gap-3'>
				<div className='space-y-1'>
					<p className='text-2xl font-bold'>{stats.total}</p>
					<p className='text-xs text-muted-foreground'>Total</p>
				</div>
				<div className='space-y-1'>
					<div className='flex items-center gap-1'>
						<p className='text-2xl font-bold text-green-600 dark:text-green-400'>{stats.completed}</p>
						<CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
					</div>
					<p className='text-xs text-muted-foreground'>Success</p>
				</div>
				<div className='space-y-1'>
					<div className='flex items-center gap-1'>
						<p className='text-2xl font-bold text-red-600 dark:text-red-400'>{stats.failed}</p>
						<XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
					</div>
					<p className='text-xs text-muted-foreground'>Failed</p>
				</div>
			</div>

			<div className='space-y-2'>
				<div className='flex items-center justify-between text-sm'>
					<span className='text-muted-foreground'>Success Rate</span>
					<Badge variant={successRate >= 80 ? 'success' : 'error'}>{successRate}%</Badge>
				</div>
				<div className='h-2 w-full overflow-hidden rounded-full bg-secondary'>
					<div className='h-full bg-primary transition-all' style={{width: `${successRate}%`}} />
				</div>
			</div>
		</div>
	)
}
