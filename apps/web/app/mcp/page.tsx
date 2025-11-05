'use client'

import {useState} from 'react'
import McpServersManager from '@/components/mcp-servers-manager'
import McpSettingsManager from '@/components/mcp-settings-manager'

type TabType = 'servers' | 'settings'

export default function McpConfigPage() {
	const [activeTab, setActiveTab] = useState<TabType>('servers')

	return (
		<div className='min-h-screen bg-gray-50 py-8'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900'>MCP Configuration</h1>
					<p className='mt-2 text-gray-600'>Manage Model Context Protocol servers, tools, and settings</p>
				</div>

				{/* Tabs */}
				<div className='bg-white rounded-lg shadow'>
					<div className='border-b border-gray-200'>
						<nav className='flex -mb-px'>
							<button onClick={() => setActiveTab('servers')} className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'servers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
								Servers
							</button>
							<button onClick={() => setActiveTab('settings')} className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
								Settings
							</button>
						</nav>
					</div>

					<div className='p-6'>
						{activeTab === 'servers' && <McpServersManager />}
						{activeTab === 'settings' && <McpSettingsManager />}
					</div>
				</div>
			</div>
		</div>
	)
}
