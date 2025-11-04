'use client'

import {useEffect, useRef, useState} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'

interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
	agentId?: string
	isStreaming?: boolean
}

interface ChatInterfaceProps {
	selectedAgent: string | null
}

export function ChatInterface({selectedAgent}: ChatInterfaceProps) {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const abortControllerRef = useRef<AbortController | null>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!input.trim() || isLoading) return

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: input,
		}

		const assistantMessageId = (Date.now() + 1).toString()
		const assistantMessage: Message = {
			id: assistantMessageId,
			role: 'assistant',
			content: '',
			isStreaming: true,
		}

		setMessages((prev) => [...prev, userMessage, assistantMessage])
		setInput('')
		setIsLoading(true)
		setError(null)
		setStreamingMessageId(assistantMessageId)

		// Create abort controller for cancellation
		abortControllerRef.current = new AbortController()

		try {
			const response = await fetch('http://localhost:3030/chat/stream', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					input: input,
					...(selectedAgent && {agentId: selectedAgent}),
				}),
				signal: abortControllerRef.current.signal,
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.error?.message || 'API error')
			}

			const reader = response.body?.getReader()
			const decoder = new TextDecoder()

			if (!reader) {
				throw new Error('No response body')
			}

			let accumulatedContent = ''
			let agentId = ''

			while (true) {
				const {done, value} = await reader.read()

				if (done) break

				const chunk = decoder.decode(value, {stream: true})
				const lines = chunk.split('\n')

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6)

						if (data === '[DONE]') {
							continue
						}

						try {
							const parsed = JSON.parse(data)

							if (parsed.agentId) {
								agentId = parsed.agentId
							}

							if (parsed.content) {
								accumulatedContent += parsed.content

								setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? {...msg, content: accumulatedContent, agentId, isStreaming: true} : msg)))
							}
						} catch {
							// Skip invalid JSON chunks
						}
					}
				}
			}

			// Mark streaming as complete
			setMessages((prev) => prev.map((msg) => (msg.id === assistantMessageId ? {...msg, isStreaming: false} : msg)))
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				setError('Request cancelled')
			} else {
				setError(err instanceof Error ? err.message : 'Unknown error')
			}

			// Remove empty assistant message on error
			setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))
		} finally {
			setIsLoading(false)
			setStreamingMessageId(null)
			abortControllerRef.current = null
		}
	}

	const handleStop = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
	}

	return (
		<div className='bg-gray-800 rounded-lg shadow-xl border border-gray-700 flex flex-col h-[calc(100vh-12rem)]'>
			{/* Chat Header */}
			<div className='p-4 border-b border-gray-700 flex justify-between items-center'>
				<div>
					<h2 className='text-xl font-bold text-white'>Chat</h2>
					{selectedAgent ? (
						<p className='text-sm text-gray-400'>
							Using: <span className='text-blue-400'>{selectedAgent}</span>
						</p>
					) : (
						<p className='text-sm text-gray-400'>Auto-routing enabled</p>
					)}
				</div>
				{isLoading && (
					<button onClick={handleStop} className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors'>
						Stop
					</button>
				)}
			</div>

			{/* Messages */}
			<div className='flex-1 overflow-y-auto p-4 space-y-4'>
				{messages.length === 0 && (
					<div className='text-center text-gray-500 mt-8'>
						<p className='text-lg mb-2'>👋 Start a conversation!</p>
						<p className='text-sm mb-4'>Try: &ldquo;Write a TypeScript function&rdquo; or &ldquo;Explain quantum computing&rdquo;</p>
						<div className='grid grid-cols-2 gap-3 max-w-2xl mx-auto mt-6'>
							<button onClick={() => setInput('Write a hello world function in TypeScript')} className='p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors'>
								<div className='text-sm font-medium text-white mb-1'>💻 Code Example</div>
								<div className='text-xs text-gray-400'>Write a hello world function</div>
							</button>
							<button onClick={() => setInput('Explain how async/await works in JavaScript')} className='p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors'>
								<div className='text-sm font-medium text-white mb-1'>📚 Explain Concept</div>
								<div className='text-xs text-gray-400'>How async/await works</div>
							</button>
							<button onClick={() => setInput('What are best practices for React components?')} className='p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors'>
								<div className='text-sm font-medium text-white mb-1'>✨ Best Practices</div>
								<div className='text-xs text-gray-400'>React component tips</div>
							</button>
							<button onClick={() => setInput("Debug this error: TypeError: Cannot read property 'map' of undefined")} className='p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors'>
								<div className='text-sm font-medium text-white mb-1'>🐛 Debug Help</div>
								<div className='text-xs text-gray-400'>Fix common errors</div>
							</button>
						</div>
					</div>
				)}

				{messages.map((message) => (
					<div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
						<div className={`max-w-[85%] rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white px-4 py-3' : 'bg-gray-700 text-gray-100'}`}>
							{message.role === 'assistant' && (
								<div className='flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-600'>
									<div className='flex items-center gap-2'>
										<span className='text-xl'>🤖</span>
										<span className='text-sm font-medium text-gray-300'>{message.agentId || 'AI Assistant'}</span>
										{message.isStreaming && <span className='text-xs text-blue-400 animate-pulse'>streaming...</span>}
									</div>
									<button onClick={() => copyToClipboard(message.content)} className='text-gray-400 hover:text-white transition-colors p-1' title='Copy to clipboard'>
										<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
										</svg>
									</button>
								</div>
							)}
							<div className={`${message.role === 'assistant' ? 'px-4 py-3' : ''}`}>
								{message.role === 'user' ? (
									<div className='whitespace-pre-wrap break-words'>{message.content}</div>
								) : (
									<div className='prose prose-invert prose-sm max-w-none'>
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											rehypePlugins={[rehypeHighlight, rehypeRaw]}
											components={{
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												code({inline, className, children, ...props}: any) {
													return !inline ? (
														<div className='relative group'>
															<div className='absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity'>
																<button onClick={() => copyToClipboard(String(children))} className='px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded'>
																	Copy
																</button>
															</div>
															<pre className={`${className} !bg-gray-900 !mt-0 !mb-0 rounded-lg overflow-x-auto`}>
																<code className={className} {...props}>
																	{children}
																</code>
															</pre>
														</div>
													) : (
														<code className='bg-gray-800 px-1.5 py-0.5 rounded text-sm' {...props}>
															{children}
														</code>
													)
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												p({children}: any) {
													return <p className='mb-3 last:mb-0'>{children}</p>
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												ul({children}: any) {
													return <ul className='list-disc list-inside mb-3 space-y-1'>{children}</ul>
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												ol({children}: any) {
													return <ol className='list-decimal list-inside mb-3 space-y-1'>{children}</ol>
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												h1({children}: any) {
													return <h1 className='text-2xl font-bold mb-3 mt-4 first:mt-0'>{children}</h1>
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												h2({children}: any) {
													return <h2 className='text-xl font-bold mb-3 mt-4 first:mt-0'>{children}</h2>
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												h3({children}: any) {
													return <h3 className='text-lg font-bold mb-2 mt-3 first:mt-0'>{children}</h3>
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												blockquote({children}: any) {
													return <blockquote className='border-l-4 border-blue-500 pl-4 italic my-3 text-gray-300'>{children}</blockquote>
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												table({children}: any) {
													return (
														<div className='overflow-x-auto my-3'>
															<table className='min-w-full border border-gray-600'>{children}</table>
														</div>
													)
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												th({children}: any) {
													return <th className='border border-gray-600 px-3 py-2 bg-gray-800 font-bold'>{children}</th>
												},
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												td({children}: any) {
													return <td className='border border-gray-600 px-3 py-2'>{children}</td>
												},
											}}>
											{message.content || '_Thinking..._'}
										</ReactMarkdown>
									</div>
								)}
							</div>
						</div>
					</div>
				))}

				{isLoading && !streamingMessageId && (
					<div className='flex justify-start'>
						<div className='bg-gray-700 text-gray-100 rounded-lg px-4 py-3'>
							<div className='flex gap-2'>
								<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
								<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]' />
								<div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]' />
							</div>
						</div>
					</div>
				)}

				{error && (
					<div className='flex justify-center'>
						<div className='bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg px-4 py-3 text-sm'>⚠️ Error: {error}</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Form */}
			<div className='p-4 border-t border-gray-700'>
				<form onSubmit={handleSubmit} className='flex gap-2'>
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder='Type your message... (Shift+Enter for new line, Enter to send)'
						className='flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 placeholder:text-gray-500'
						rows={3}
						disabled={isLoading}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault()
								handleSubmit(e)
							}
						}}
					/>
					<button type='submit' disabled={isLoading || !input.trim()} className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2'>
						{isLoading ? (
							<>
								<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
								<span>Sending...</span>
							</>
						) : (
							<>
								<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
								</svg>
								<span>Send</span>
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	)
}
