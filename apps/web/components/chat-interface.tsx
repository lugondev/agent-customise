'use client'

import {useState, useRef, useEffect} from 'react'
import {sendMessage} from '../lib/api/chat-api'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Send, Bot, User, Loader2} from 'lucide-react'
import {cn} from '@/lib/utils'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
	timestamp: Date
}

interface ChatInterfaceProps {
	selectedAgent?: string | null
}

export function ChatInterface({selectedAgent}: ChatInterfaceProps) {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const scrollAreaRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const formatMessage = (content: string) => {
		const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
		return content.replace(codeBlockRegex, (match, language, code) => {
			if (language && hljs.getLanguage(language)) {
				try {
					return `<pre class="rounded-md bg-muted p-4 my-2 overflow-x-auto"><code class="hljs ${language}">${hljs.highlight(code, {language}).value}</code></pre>`
				} catch {
					return `<pre class="rounded-md bg-muted p-4 my-2 overflow-x-auto"><code class="hljs">${hljs.highlightAuto(code).value}</code></pre>`
				}
			}
			return `<pre class="rounded-md bg-muted p-4 my-2 overflow-x-auto"><code class="hljs">${hljs.highlightAuto(code).value}</code></pre>`
		})
	}

	const handleSend = async () => {
		if (!input.trim() || loading) return

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: input.trim(),
			timestamp: new Date(),
		}

		setMessages((prev) => [...prev, userMessage])
		setInput('')
		setLoading(true)
		setError(null)

		try {
			const response = await sendMessage(input.trim(), selectedAgent || undefined)
			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: response.response || 'No response received',
				timestamp: new Date(),
			}
			setMessages((prev) => [...prev, assistantMessage])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to send message')
		} finally {
			setLoading(false)
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	return (
		<Card className='flex h-full flex-col'>
			<CardHeader className='border-b'>
				<CardTitle className='flex items-center gap-2'>
					<Bot className='h-5 w-5' />
					Chat Assistant
					{selectedAgent && <span className='text-sm font-normal text-muted-foreground'>({selectedAgent})</span>}
				</CardTitle>
			</CardHeader>

			<CardContent className='flex flex-1 flex-col gap-4 p-4'>
				<ScrollArea className='flex-1 pr-4' ref={scrollAreaRef}>
					<div className='space-y-4'>
						{messages.length === 0 && (
							<div className='flex h-full items-center justify-center text-center text-muted-foreground'>
								<div>
									<Bot className='mx-auto h-12 w-12 mb-4 opacity-50' />
									<p className='text-lg font-medium'>Start a conversation</p>
									<p className='text-sm'>Send a message to begin chatting with the AI assistant</p>
								</div>
							</div>
						)}

						{messages.map((message) => (
							<div key={message.id} className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}>
								<Avatar className='h-8 w-8'>
									<AvatarFallback className={cn('text-xs', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>{message.role === 'user' ? <User className='h-4 w-4' /> : <Bot className='h-4 w-4' />}</AvatarFallback>
								</Avatar>

								<div className={cn('flex flex-col gap-1 max-w-[80%]', message.role === 'user' && 'items-end')}>
									<div className={cn('rounded-lg px-4 py-2', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
										<div className='prose prose-sm dark:prose-invert max-w-none' dangerouslySetInnerHTML={{__html: formatMessage(message.content)}} />
									</div>
									<span className='text-xs text-muted-foreground'>{message.timestamp.toLocaleTimeString()}</span>
								</div>
							</div>
						))}

						{loading && (
							<div className='flex gap-3'>
								<Avatar className='h-8 w-8'>
									<AvatarFallback className='bg-secondary text-secondary-foreground'>
										<Bot className='h-4 w-4' />
									</AvatarFallback>
								</Avatar>
								<div className='flex items-center gap-2 rounded-lg bg-muted px-4 py-2'>
									<Loader2 className='h-4 w-4 animate-spin' />
									<span className='text-sm text-muted-foreground'>Thinking...</span>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>
				</ScrollArea>

				<div className='flex items-center gap-2 border-t pt-4'>
					<Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder='Type your message...' className='flex-1' disabled={loading} />
					<Button onClick={handleSend} disabled={loading || !input.trim()} size='icon'>
						<Send className='h-4 w-4' />
					</Button>
				</div>

				{error && <p className='text-sm text-destructive'>{error}</p>}
			</CardContent>
		</Card>
	)
}
