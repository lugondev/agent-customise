'use client'

import {useState, useEffect} from 'react'
import {McpServer, CreateMcpServerDto, UpdateMcpServerDto} from '@agent/shared'
import {getAllMcpServers, createMcpServer, updateMcpServer, deleteMcpServer, getMcpServerWithTools} from '@/lib/api/mcp-api'

export default function McpServersManager() {
	const [servers, setServers] = useState<McpServer[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [editingServer, setEditingServer] = useState<McpServer | null>(null)
	const [showCreateForm, setShowCreateForm] = useState(false)

	// Form state
	const [formData, setFormData] = useState<CreateMcpServerDto>({
		name: '',
		command: '',
		args: [],
		env: {},
		enabled: true,
		description: '',
	})

	const [argsInput, setArgsInput] = useState('')
	const [envInput, setEnvInput] = useState('')

	useEffect(() => {
		loadServers()
	}, [])

	const loadServers = async () => {
		try {
			setLoading(true)
			const data = await getAllMcpServers()
			setServers(data)
			setError(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load servers')
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		try {
			// Parse args from comma-separated string
			const args = argsInput
				.split(',')
				.map((arg) => arg.trim())
				.filter((arg) => arg)

			// Parse env from key=value pairs (one per line)
			const env: Record<string, string> = {}
			if (envInput.trim()) {
				envInput.split('\n').forEach((line) => {
					const [key, ...valueParts] = line.split('=')
					if (key && valueParts.length > 0) {
						env[key.trim()] = valueParts.join('=').trim()
					}
				})
			}

			const payload = {
				...formData,
				args,
				env: Object.keys(env).length > 0 ? env : undefined,
			}

			if (editingServer) {
				await updateMcpServer(editingServer.id, payload)
			} else {
				await createMcpServer(payload)
			}

			// Reset form
			resetForm()
			loadServers()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save server')
		}
	}

	const handleEdit = (server: McpServer) => {
		setEditingServer(server)
		setFormData({
			name: server.name,
			command: server.command,
			args: server.args,
			env: server.env,
			enabled: server.enabled,
			description: server.description,
		})
		setArgsInput(server.args.join(', '))
		setEnvInput(
			server.env
				? Object.entries(server.env)
						.map(([key, value]) => `${key}=${value}`)
						.join('\n')
				: '',
		)
		setShowCreateForm(true)
	}

	const handleDelete = async (id: string) => {
		if (!confirm('Are you sure you want to delete this server?')) return

		try {
			await deleteMcpServer(id)
			loadServers()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete server')
		}
	}

	const handleToggleEnabled = async (server: McpServer) => {
		try {
			await updateMcpServer(server.id, {enabled: !server.enabled})
			loadServers()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to toggle server')
		}
	}

	const resetForm = () => {
		setFormData({
			name: '',
			command: '',
			args: [],
			env: {},
			enabled: true,
			description: '',
		})
		setArgsInput('')
		setEnvInput('')
		setEditingServer(null)
		setShowCreateForm(false)
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center p-8'>
				<div className='text-gray-600'>Loading MCP servers...</div>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<h2 className='text-2xl font-bold text-gray-900'>MCP Servers</h2>
				<button onClick={() => setShowCreateForm(!showCreateForm)} className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
					{showCreateForm ? 'Cancel' : 'Add Server'}
				</button>
			</div>

			{/* Error display */}
			{error && <div className='p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>{error}</div>}

			{/* Create/Edit Form */}
			{showCreateForm && (
				<form onSubmit={handleSubmit} className='bg-white p-6 rounded-lg border space-y-4'>
					<h3 className='text-xl font-semibold text-gray-900'>{editingServer ? 'Edit Server' : 'Create New Server'}</h3>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Server Name *</label>
						<input type='text' value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' required />
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Command *</label>
						<input type='text' value={formData.command} onChange={(e) => setFormData({...formData, command: e.target.value})} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='e.g., npx, node, python' required />
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Arguments (comma-separated)</label>
						<input type='text' value={argsInput} onChange={(e) => setArgsInput(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='e.g., -m, mcp-server, --port, 3000' />
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Environment Variables (key=value, one per line)</label>
						<textarea
							value={envInput}
							onChange={(e) => setEnvInput(e.target.value)}
							className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
							rows={4}
							placeholder='API_KEY=your_key&#10;PORT=3000'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
						<textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' rows={3} />
					</div>

					<div className='flex items-center'>
						<input type='checkbox' id='enabled' checked={formData.enabled} onChange={(e) => setFormData({...formData, enabled: e.target.checked})} className='w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500' />
						<label htmlFor='enabled' className='ml-2 text-sm font-medium text-gray-700'>
							Enabled
						</label>
					</div>

					<div className='flex gap-3'>
						<button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
							{editingServer ? 'Update' : 'Create'}
						</button>
						<button type='button' onClick={resetForm} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'>
							Cancel
						</button>
					</div>
				</form>
			)}

			{/* Servers List */}
			<div className='space-y-4'>
				{servers.length === 0 ? (
					<div className='text-center p-8 bg-gray-50 rounded-lg'>
						<p className='text-gray-600'>No MCP servers configured yet.</p>
					</div>
				) : (
					servers.map((server) => (
						<div key={server.id} className='bg-white p-6 rounded-lg border hover:border-blue-300 transition-colors'>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<div className='flex items-center gap-3'>
										<h3 className='text-lg font-semibold text-gray-900'>{server.name}</h3>
										<span className={`px-2 py-1 text-xs rounded-full ${server.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{server.enabled ? 'Enabled' : 'Disabled'}</span>
									</div>
									{server.description && <p className='text-sm text-gray-600 mt-2'>{server.description}</p>}
									<div className='mt-3 space-y-1 text-sm'>
										<div className='flex items-start gap-2'>
											<span className='font-medium text-gray-700'>Command:</span>
											<code className='px-2 py-1 bg-gray-100 rounded text-gray-800'>
												{server.command} {server.args.join(' ')}
											</code>
										</div>
										{server.env && Object.keys(server.env).length > 0 && (
											<div className='flex items-start gap-2'>
												<span className='font-medium text-gray-700'>Environment:</span>
												<div className='flex flex-wrap gap-2'>
													{Object.keys(server.env).map((key) => (
														<code key={key} className='px-2 py-1 bg-gray-100 rounded text-gray-800'>
															{key}
														</code>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
								<div className='flex gap-2'>
									<button onClick={() => handleToggleEnabled(server)} className='px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors'>
										{server.enabled ? 'Disable' : 'Enable'}
									</button>
									<button onClick={() => handleEdit(server)} className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'>
										Edit
									</button>
									<button onClick={() => handleDelete(server.id)} className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors'>
										Delete
									</button>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
