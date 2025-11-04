'use client'

import {useState} from 'react'

interface Agent {
	id: string
	modelId: string
	roles: string[]
	capabilities: string[]
	systemPrompt: string
}

interface AgentSelectorProps {
	selectedAgent: string | null
	onSelectAgent: (agentId: string | null) => void
}

const AGENTS: Agent[] = [
	{
		id: 'generalist-gpt',
		modelId: 'gpt-5-nano',
		roles: ['general', 'unknown'],
		capabilities: ['creative', 'reasoning'],
		systemPrompt: 'General purpose AI assistant',
	},
	{
		id: 'coding-expert',
		modelId: 'deepseek-chat',
		roles: ['coding', 'tech'],
		capabilities: ['coding', 'debugging', 'architecture'],
		systemPrompt: 'Expert software engineer',
	},
	{
		id: 'analyst-deepseek',
		modelId: 'deepseek-chat',
		roles: ['analysis', 'research'],
		capabilities: ['reasoning', 'analysis', 'writing'],
		systemPrompt: 'Deep thinking analyst',
	},
	{
		id: 'creative-gemini',
		modelId: 'gemini-2.5-flash-lite',
		roles: ['creative', 'brainstorm'],
		capabilities: ['creative', 'multimodal'],
		systemPrompt: 'Creative AI with multimodal capabilities',
	},
	{
		id: 'fast-claude',
		modelId: 'claude-haiku-4.5',
		roles: ['quick', 'simple'],
		capabilities: ['fast', 'simple-tasks'],
		systemPrompt: 'Quick and efficient assistant',
	},
	{
		id: 'grok-assistant',
		modelId: 'grok-4-fast',
		roles: ['chat', 'conversation'],
		capabilities: ['reasoning', 'creative'],
		systemPrompt: 'Witty AI with sense of humor',
	},
	{
		id: 'budget-assistant',
		modelId: 'gpt-4o-mini',
		roles: ['free', 'budget'],
		capabilities: ['reasoning', 'coding'],
		systemPrompt: 'Cost-effective responses',
	},
]

const MODEL_COLORS: Record<string, string> = {
	'gpt-5-nano': 'bg-green-500/20 text-green-400 border-green-500/30',
	'deepseek-chat': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
	'gemini-2.5-flash-lite': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
	'claude-haiku-4.5': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
	'grok-4-fast': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
	'gpt-4o-mini': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

export function AgentSelector({selectedAgent, onSelectAgent}: AgentSelectorProps) {
	const [autoRoute, setAutoRoute] = useState(true)

	return (
		<div className='bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700'>
			<div className='mb-6'>
				<h2 className='text-xl font-bold text-white mb-2'>Agents</h2>
				<label className='flex items-center gap-2 text-sm text-gray-400 cursor-pointer'>
					<input
						type='checkbox'
						checked={autoRoute}
						onChange={(e) => {
							setAutoRoute(e.target.checked)
							if (e.target.checked) onSelectAgent(null)
						}}
						className='w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500'
					/>
					Auto-route by input
				</label>
			</div>

			<div className='space-y-3'>
				{AGENTS.map((agent) => {
					const isSelected = selectedAgent === agent.id
					const colorClass = MODEL_COLORS[agent.modelId] || 'bg-gray-700 text-gray-300'

					return (
						<button key={agent.id} onClick={() => onSelectAgent(isSelected ? null : agent.id)} disabled={autoRoute} className={`w-full text-left p-4 rounded-lg border transition-all ${autoRoute ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] cursor-pointer'} ${isSelected ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' : 'border-gray-700 bg-gray-750'}`}>
							<div className='flex items-start justify-between mb-2'>
								<h3 className='font-semibold text-white text-sm'>
									{agent.id
										.split('-')
										.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
										.join(' ')}
								</h3>
								{isSelected && <span className='text-blue-400 text-xs'>✓ Selected</span>}
							</div>

							<div className={`inline-block px-2 py-1 rounded text-xs font-mono border mb-2 ${colorClass}`}>{agent.modelId}</div>

							<div className='flex flex-wrap gap-1 mb-2'>
								{agent.capabilities.slice(0, 3).map((cap) => (
									<span key={cap} className='px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs'>
										{cap}
									</span>
								))}
							</div>

							<p className='text-xs text-gray-400 line-clamp-2'>{agent.systemPrompt}</p>
						</button>
					)
				})}
			</div>
		</div>
	)
}
