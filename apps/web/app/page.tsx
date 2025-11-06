'use client'

import {useState} from 'react'
import {ChatInterface} from '@/components/chat-interface'
import {AgentSelector} from '@/components/agent-selector'
import ModelStats from '@/components/model-stats'
import McpStatusWidget from '@/components/mcp-status-widget'
import {Card} from '@/components/ui/card'

export default function Home() {
	const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

	return (
		<div className='container mx-auto h-[calc(100vh-4rem)] p-4'>
			<div className='grid h-full gap-4 lg:grid-cols-[1fr_320px]'>
				{/* Main Chat Area */}
				<div className='flex flex-col gap-4'>
					<ChatInterface selectedAgent={selectedAgent} />
				</div>

				{/* Sidebar */}
				<div className='flex flex-col gap-4 overflow-y-auto'>
					<Card className='p-4'>
						<h2 className='mb-4 text-lg font-semibold'>Agent Selection</h2>
						<AgentSelector selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
					</Card>

					<Card className='p-4'>
						<h2 className='mb-4 text-lg font-semibold'>MCP Status</h2>
						<McpStatusWidget />
					</Card>

					<Card className='p-4'>
						<h2 className='mb-4 text-lg font-semibold'>Model Statistics</h2>
						<ModelStats />
					</Card>
				</div>
			</div>
		</div>
	)
}
