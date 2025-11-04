'use client'

import {useEffect, useState} from 'react'

interface Run {
	id: string
	goal: string
	status: string
	createdAt: string
}

interface RunStats {
	totalRuns: number
	completedRuns: number
	failedRuns: number
}

export function ModelStats() {
	const [stats, setStats] = useState<RunStats | null>(null)
	const [recentRuns, setRecentRuns] = useState<Run[]>([])

	const fetchStats = async () => {
		try {
			const response = await fetch('http://localhost:3030/planner/runs?limit=5')
			const data = await response.json()

			if (data.data?.runs) {
				setRecentRuns(data.data.runs)

				const completed = data.data.runs.filter((r: Run) => r.status === 'completed').length
				const failed = data.data.runs.filter((r: Run) => r.status === 'failed').length

				setStats({
					totalRuns: data.data.runs.length,
					completedRuns: completed,
					failedRuns: failed,
				})
			}
		} catch (error) {
			console.error('Failed to fetch stats:', error)
		}
	}

	useEffect(() => {
		// Avoid synchronous setState in effect
		const loadInitialStats = async () => {
			await fetchStats()
		}

		loadInitialStats()
		const interval = setInterval(fetchStats, 5000)
		return () => clearInterval(interval)
	}, [])

	return (
		<div className='space-y-6'>
			{/* Stats Card */}
			<div className='bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700'>
				<h2 className='text-xl font-bold text-white mb-4'>System Stats</h2>

				{stats ? (
					<div className='space-y-4'>
						<div className='flex justify-between items-center'>
							<span className='text-gray-400'>Total Runs</span>
							<span className='text-2xl font-bold text-white'>{stats.totalRuns}</span>
						</div>

						<div className='flex justify-between items-center'>
							<span className='text-gray-400'>Completed</span>
							<span className='text-xl font-semibold text-green-400'>{stats.completedRuns}</span>
						</div>

						<div className='flex justify-between items-center'>
							<span className='text-gray-400'>Failed</span>
							<span className='text-xl font-semibold text-red-400'>{stats.failedRuns}</span>
						</div>

						{stats.totalRuns > 0 && (
							<div className='pt-4 border-t border-gray-700'>
								<div className='flex justify-between text-sm mb-2'>
									<span className='text-gray-400'>Success Rate</span>
									<span className='text-white font-medium'>{Math.round((stats.completedRuns / stats.totalRuns) * 100)}%</span>
								</div>
								<div className='w-full bg-gray-700 rounded-full h-2'>
									<div
										className='bg-green-500 h-2 rounded-full transition-all'
										style={{
											width: `${(stats.completedRuns / stats.totalRuns) * 100}%`,
										}}
									/>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className='text-gray-500 text-center py-4'>Loading stats...</div>
				)}
			</div>

			{/* Recent Runs */}
			<div className='bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700'>
				<h2 className='text-xl font-bold text-white mb-4'>Recent Runs</h2>

				{recentRuns.length > 0 ? (
					<div className='space-y-3'>
						{recentRuns.map((run) => (
							<div key={run.id} className='bg-gray-750 rounded-lg p-3 border border-gray-700'>
								<div className='flex items-start justify-between mb-2'>
									<span className='text-xs font-mono text-gray-500'>{run.id.slice(-8)}</span>
									<span className={`text-xs px-2 py-0.5 rounded ${run.status === 'completed' ? 'bg-green-500/20 text-green-400' : run.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{run.status}</span>
								</div>
								<p className='text-sm text-gray-300 line-clamp-2'>{run.goal}</p>
								<div className='text-xs text-gray-500 mt-1'>{new Date(run.createdAt).toLocaleString()}</div>
							</div>
						))}
					</div>
				) : (
					<div className='text-gray-500 text-center py-4 text-sm'>No runs yet</div>
				)}
			</div>

			{/* Quick Actions */}
			<div className='bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700'>
				<h2 className='text-xl font-bold text-white mb-4'>Quick Actions</h2>

				<div className='space-y-2'>
					<a href='http://localhost:3030/health' target='_blank' rel='noopener noreferrer' className='block w-full text-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm'>
						🏥 Health Check
					</a>

					<button onClick={() => window.location.reload()} className='w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm'>
						🔄 Refresh Stats
					</button>

					<a href='https://openrouter.ai/activity' target='_blank' rel='noopener noreferrer' className='block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm'>
						📊 OpenRouter Dashboard
					</a>
				</div>
			</div>
		</div>
	)
}
