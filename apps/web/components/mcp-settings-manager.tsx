'use client'

import {useState, useEffect} from 'react'
import {McpSetting} from '@agent/shared'
import {getAllMcpSettings, upsertMcpSetting, deleteMcpSetting} from '@/lib/api/mcp-api'

export default function McpSettingsManager() {
	const [settings, setSettings] = useState<McpSetting[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [showCreateForm, setShowCreateForm] = useState(false)

	// Form state
	const [formKey, setFormKey] = useState('')
	const [formValue, setFormValue] = useState('')

	useEffect(() => {
		loadSettings()
	}, [])

	const loadSettings = async () => {
		try {
			setLoading(true)
			const data = await getAllMcpSettings()
			setSettings(data)
			setError(null)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load settings')
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		try {
			let parsedValue: unknown
			try {
				parsedValue = JSON.parse(formValue)
			} catch {
				parsedValue = formValue
			}

			await upsertMcpSetting(formKey, parsedValue)
			resetForm()
			loadSettings()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save setting')
		}
	}

	const handleDelete = async (key: string) => {
		if (!confirm(`Are you sure you want to delete setting "${key}"?`)) return

		try {
			await deleteMcpSetting(key)
			loadSettings()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete setting')
		}
	}

	const handleEdit = (setting: McpSetting) => {
		setFormKey(setting.key)
		setFormValue(typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2))
		setShowCreateForm(true)
	}

	const resetForm = () => {
		setFormKey('')
		setFormValue('')
		setShowCreateForm(false)
	}

	if (loading) {
		return (
			<div className='flex items-center justify-center p-8'>
				<div className='text-gray-600'>Loading MCP settings...</div>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<h2 className='text-2xl font-bold text-gray-900'>MCP Settings</h2>
				<button onClick={() => setShowCreateForm(!showCreateForm)} className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
					{showCreateForm ? 'Cancel' : 'Add Setting'}
				</button>
			</div>

			{/* Error display */}
			{error && <div className='p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>{error}</div>}

			{/* Create/Edit Form */}
			{showCreateForm && (
				<form onSubmit={handleSubmit} className='bg-white p-6 rounded-lg border space-y-4'>
					<h3 className='text-xl font-semibold text-gray-900'>{formKey ? 'Edit Setting' : 'Create New Setting'}</h3>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Setting Key *</label>
						<input type='text' value={formKey} onChange={(e) => setFormKey(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='e.g., max_concurrent_servers, default_timeout' required />
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Value (JSON or plain text) *</label>
						<textarea value={formValue} onChange={(e) => setFormValue(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm' rows={6} placeholder='{"enabled": true, "timeout": 30000}' required />
						<p className='mt-1 text-xs text-gray-500'>Enter valid JSON for complex values, or plain text for simple strings</p>
					</div>

					<div className='flex gap-3'>
						<button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
							Save
						</button>
						<button type='button' onClick={resetForm} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'>
							Cancel
						</button>
					</div>
				</form>
			)}

			{/* Settings List */}
			<div className='space-y-4'>
				{settings.length === 0 ? (
					<div className='text-center p-8 bg-gray-50 rounded-lg'>
						<p className='text-gray-600'>No MCP settings configured yet.</p>
					</div>
				) : (
					settings.map((setting) => (
						<div key={setting.id} className='bg-white p-6 rounded-lg border hover:border-blue-300 transition-colors'>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									<h3 className='text-lg font-semibold text-gray-900'>{setting.key}</h3>
									<div className='mt-3'>
										<div className='text-sm font-medium text-gray-700 mb-2'>Value:</div>
										<pre className='p-3 bg-gray-50 rounded-lg text-sm overflow-x-auto'>{typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2)}</pre>
									</div>
									<div className='mt-2 text-xs text-gray-500'>Updated: {new Date(setting.updatedAt).toLocaleString()}</div>
								</div>
								<div className='flex gap-2'>
									<button onClick={() => handleEdit(setting)} className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'>
										Edit
									</button>
									<button onClick={() => handleDelete(setting.key)} className='px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors'>
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
