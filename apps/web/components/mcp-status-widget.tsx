'use client'

import {useState, useEffect} from 'react'
import {McpServer} from '@agent/shared'
import {getAllMcpServers, getEnabledMcpServers} from '@/lib/api/mcp-api'

interface McpStats {
	total: number
	enabled: number
	disabled: number
}

export default function McpStatusWidget() {
	const [stats, setStats] = useState<McpStats>({total: 0, enabled: 0, disabled: 0})
	const [servers, setServers] = useState<McpServer[]>([])
	const [loading, setLoading] = useState(true)
	const [showDetails, setShowDetails] = useState(false)

	useEffect(() => {
		loadStats()
		// Refresh every 30 seconds
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
			<div className='bg-white rounded-lg shadow p-4'>
				<div className='animate-pulse'>
					<div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
					<div className='space-y-2'>
						<div className='h-3 bg-gray-200 rounded'></div>
						<div className='h-3 bg-gray-200 rounded w-5/6'></div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='bg-white rounded-lg shadow'>
			<div className='p-4 border-b border-gray-200'>
				<div className='flex items-center justify-between'>
					<h3 className='text-lg font-semibold text-gray-900'>MCP Status</h3>
					<button onClick={() => setShowDetails(!showDetails)} className='text-sm text-blue-600 hover:text-blue-700'>
						{showDetails ? 'Hide' : 'Show'} Details
					</button>
				</div>
			</div>

			<div className='p-4 space-y-3'>
				{/* Stats Grid */}
				<div className='grid grid-cols-3 gap-4'>
					<div className='text-center'>
						<div className='text-2xl font-bold text-gray-900'>{stats.total}</div>
						<div className='text-xs text-gray-500'>Total Servers</div>
					</div>
					<div className='text-center'>
						<div className='text-2xl font-bold text-green-600'>{stats.enabled}</div>
						<div className='text-xs text-gray-500'>Enabled</div>
					</div>
					<div className='text-center'>
						<div className='text-2xl font-bold text-gray-400'>{stats.disabled}</div>
						<div className='text-xs text-gray-500'>Disabled</div>
					</div>
				</div>

				{/* Status Indicator */}
				<div className='flex items-center gap-2 pt-2'>
					<div className={`w-2 h-2 rounded-full ${stats.enabled > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
					<span className='text-sm text-gray-600'>{stats.enabled > 0 ? `${stats.enabled} server${stats.enabled > 1 ? 's' : ''} active` : 'No active servers'}</span>
				</div>

				{/* Server List (when details shown) */}
				{showDetails && servers.length > 0 && (
					<div className='mt-4 pt-4 border-t border-gray-200'>
						<div className='space-y-2'>
							{servers.map((server) => (
								<div key={server.id} className='flex items-center justify-between text-sm py-2'>
									<div className='flex items-center gap-2'>
										<div className={`w-2 h-2 rounded-full ${server.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
										<span className='text-gray-700 font-medium'>{server.name}</span>
									</div>
									<span className={`px-2 py-1 text-xs rounded-full ${server.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{server.enabled ? 'Active' : 'Inactive'}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{servers.length === 0 && <div className='text-center py-4 text-sm text-gray-500'>No MCP servers configured</div>}
			</div>
		</div>
	)
}
