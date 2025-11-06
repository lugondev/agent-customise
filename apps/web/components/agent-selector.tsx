'use client'

import {useState} from 'react'
import {Switch} from '@/components/ui/switch'
import {Badge} from '@/components/ui/badge'
import {Label} from '@/components/ui/label'
import {Check, Bot, Sparkles, Brain, Gem, Zap, Rocket, Coins} from 'lucide-react'
import {cn} from '@/lib/utils'

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

const MODEL_ICONS: Record<string, React.ReactNode> = {
	'gpt-5-nano': <Sparkles className='w-4 h-4' />,
	'deepseek-chat': <Brain className='w-4 h-4' />,
	'gemini-2.5-flash-lite': <Gem className='w-4 h-4' />,
	'claude-haiku-4.5': <Zap className='w-4 h-4' />,
	'grok-4-fast': <Rocket className='w-4 h-4' />,
	'gpt-4o-mini': <Coins className='w-4 h-4' />,
}

const MODEL_COLORS: Record<string, string> = {
	'gpt-5-nano': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
	'deepseek-chat': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
	'gemini-2.5-flash-lite': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
	'claude-haiku-4.5': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
	'grok-4-fast': 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
	'gpt-4o-mini': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
}

export function AgentSelector({selectedAgent, onSelectAgent}: AgentSelectorProps) {
	const [autoRoute, setAutoRoute] = useState(true)

	const handleAgentClick = (agentId: string) => {
		if (autoRoute) return
		onSelectAgent(selectedAgent === agentId ? null : agentId)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-2'>
					<Switch id='auto-route' checked={autoRoute} onCheckedChange={setAutoRoute} />
					<Label htmlFor='auto-route' className='text-sm font-medium'>
						Auto-route
					</Label>
				</div>
			</div>

			<div className='space-y-2'>
				{AGENTS.map((agent) => {
					const isSelected = !autoRoute && selectedAgent === agent.id
					return (
						<button key={agent.id} onClick={() => handleAgentClick(agent.id)} disabled={autoRoute} className={cn('w-full rounded-lg border p-3 text-left transition-colors', 'hover:bg-accent hover:text-accent-foreground', 'disabled:cursor-not-allowed disabled:opacity-50', isSelected && 'border-primary bg-accent')}>
							<div className='flex items-start gap-3'>
								<div className={cn('flex h-10 w-10 items-center justify-center rounded-full', MODEL_COLORS[agent.modelId])}>{MODEL_ICONS[agent.modelId] || <Bot className='h-4 w-4' />}</div>

								<div className='flex-1 space-y-1'>
									<div className='flex items-center justify-between'>
										<h4 className='text-sm font-semibold'>{agent.id}</h4>
										{isSelected && <Check className='h-4 w-4 text-primary' />}
									</div>
									<p className='text-xs text-muted-foreground line-clamp-2'>{agent.systemPrompt}</p>
									<div className='flex flex-wrap gap-1'>
										{agent.capabilities.slice(0, 2).map((cap) => (
											<Badge key={cap} variant='secondary' className='text-xs'>
												{cap}
											</Badge>
										))}
									</div>
								</div>
							</div>
						</button>
					)
				})}
			</div>
		</div>
	)
}
