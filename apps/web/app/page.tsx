'use client'

import {useState} from 'react'
import Link from 'next/link'
import {ChatInterface} from '@/components/chat-interface'
import {AgentSelector} from '@/components/agent-selector'
import {ModelStats} from '@/components/model-stats'
import McpStatusWidget from '@/components/mcp-status-widget'

export default function Home() {
	const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
			<div className='container mx-auto px-4 py-8'>
				<header className='mb-8 flex items-center justify-between'>
					<div>
						<h1 className='text-4xl font-bold text-white mb-2'>Multi-Agent AI System</h1>
						<p className='text-gray-400'>Powered by OpenRouter - GPT, Claude, Gemini, Grok, DeepSeek</p>
					</div>
					<Link href='/mcp' className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
						MCP Config
					</Link>
				</header>

				<div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
					<div className='lg:col-span-3 space-y-6'>
						<AgentSelector selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
						<McpStatusWidget />
					</div>

					<div className='lg:col-span-6'>
						<ChatInterface selectedAgent={selectedAgent} />
					</div>

					<div className='lg:col-span-3'>
						<ModelStats />
					</div>
				</div>
			</div>
		</div>
	)
}
