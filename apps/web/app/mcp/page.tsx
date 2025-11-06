'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Server, Settings, Plus, Power, PowerOff, Trash2, Edit3, Save, X } from 'lucide-react'

type TabType = 'servers' | 'settings'

interface McpServer {
  id: string
  name: string
  description: string
  status: 'running' | 'stopped' | 'error'
  port: number
  version: string
  tools: number
}

export default function McpConfigPage() {
  const [activeTab, setActiveTab] = useState<TabType>('servers')
  const [servers, setServers] = useState<McpServer[]>([
    {
      id: '1',
      name: 'File System',
      description: 'File operations and directory management',
      status: 'running',
      port: 8080,
      version: '1.2.0',
      tools: 8
    },
    {
      id: '2', 
      name: 'Database',
      description: 'SQL database operations and queries',
      status: 'running',
      port: 8081,
      version: '1.0.3',
      tools: 12
    },
    {
      id: '3',
      name: 'Web Search',
      description: 'Internet search and web scraping',
      status: 'stopped',
      port: 8082,
      version: '0.9.1',
      tools: 5
    }
  ])
  const [editingServer, setEditingServer] = useState<string | null>(null)
  const [newServerName, setNewServerName] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const toggleServerStatus = (serverId: string) => {
    setServers(servers.map(server => 
      server.id === serverId 
        ? { ...server, status: server.status === 'running' ? 'stopped' : 'running' }
        : server
    ))
  }

  const deleteServer = (serverId: string) => {
    setServers(servers.filter(server => server.id !== serverId))
  }

  const addServer = () => {
    if (newServerName.trim()) {
      const newServer: McpServer = {
        id: Date.now().toString(),
        name: newServerName,
        description: 'New MCP server',
        status: 'stopped',
        port: 8080 + servers.length,
        version: '1.0.0',
        tools: 0
      }
      setServers([...servers, newServer])
      setNewServerName('')
      setShowAddForm(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'stopped': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
      case 'error': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark flex items-center justify-center">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">MCP Configuration</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage Model Context Protocol servers and settings</p>
            </div>
          </div>
        </div>

        {/* Simplified Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('servers')}
              aria-pressed={activeTab === 'servers'}
              aria-label={`Servers tab (${servers.length} servers)`}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                activeTab === 'servers'
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Server className="w-4 h-4" aria-hidden="true" />
              Servers
              <Badge variant="secondary" size="sm" aria-label={`${servers.length} servers`}>{servers.length}</Badge>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              aria-pressed={activeTab === 'settings'}
              aria-label="Settings tab"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                activeTab === 'settings'
                  ? 'bg-background text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              Settings
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'servers' && (
          <div className="space-y-4">
            {/* Add Server Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-foreground">MCP Servers</h2>
              <Button onClick={() => setShowAddForm(true)} size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Server
              </Button>
            </div>

            {/* Add Server Form */}
            {showAddForm && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Server name"
                      value={newServerName}
                      onChange={(e) => setNewServerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addServer()}
                      className="flex-1"
                      aria-label="Server name input"
                    />
                    <div className="flex gap-2">
                      <Button onClick={addServer} size="sm" className="flex-1 sm:flex-none">
                        <Save className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                      <Button onClick={() => setShowAddForm(false)} variant="secondary" size="sm" className="flex-1 sm:flex-none">
                        <X className="w-4 h-4" aria-label="Cancel adding server" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Server List */}
            <div className="grid gap-3 sm:gap-4 stagger-children">
              {servers.map((server, index) => (
                <Card key={server.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-3 sm:gap-4 w-full">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-surface-light dark:bg-surface-dark flex items-center justify-center flex-shrink-0">
                          <Server className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base">{server.name}</h3>
                            <Badge variant="secondary" className="text-xs" aria-label={`Version ${server.version}`}>
                              v{server.version}
                            </Badge>
                            <Badge className={`${getStatusColor(server.status)}`} aria-label={`Status: ${server.status}`}>
                              {server.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 break-words">{server.description}</p>
                          <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
                            <span>Port: {server.port}</span>
                            <span>Tools: {server.tools}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          onClick={() => toggleServerStatus(server.id)}
                          variant={server.status === 'running' ? 'secondary' : 'primary'}
                          size="sm"
                          className="flex-1 sm:flex-none"
                          aria-label={server.status === 'running' ? `Stop ${server.name}` : `Start ${server.name}`}
                        >
                          {server.status === 'running' ? (
                            <><PowerOff className="w-4 h-4 mr-2" aria-hidden="true" /> Stop</>
                          ) : (
                            <><Power className="w-4 h-4 mr-2" aria-hidden="true" /> Start</>
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteServer(server.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          aria-label={`Delete ${server.name}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {servers.length === 0 && (
              <Card>
                <CardContent className="p-6 sm:p-12 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Server className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No MCP servers configured</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">Get started by adding your first MCP server</p>
                  <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                    Add Server
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general MCP server settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label htmlFor="auto-start" className="text-sm sm:text-base">Auto-start servers</Label>
                  <Switch id="auto-start" aria-label="Auto-start servers" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label htmlFor="auto-update" className="text-sm sm:text-base">Auto-update</Label>
                  <Switch id="auto-update" aria-label="Auto-update" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="log-level" className="text-sm sm:text-base">Log Level</Label>
                  <Select>
                    <SelectTrigger id="log-level" className="focus:animate-focus" aria-label="Select log level">
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warn</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Settings</CardTitle>
                <CardDescription>Configure connection timeouts and retry settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timeout" className="text-sm sm:text-base">Connection Timeout (seconds)</Label>
                  <Input id="timeout" type="number" placeholder="30" className="focus:animate-focus" aria-label="Connection timeout in seconds" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retries" className="text-sm sm:text-base">Max Retries</Label>
                  <Input id="retries" type="number" placeholder="3" className="focus:animate-focus" aria-label="Maximum retry attempts" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retry-delay" className="text-sm sm:text-base">Retry Delay (seconds)</Label>
                  <Input id="retry-delay" type="number" placeholder="5" className="focus:animate-focus" aria-label="Delay between retries in seconds" />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button className="w-full sm:w-auto" aria-label="Save settings">Save Settings</Button>
              <Button variant="secondary" className="w-full sm:w-auto" aria-label="Reset settings to defaults">Reset to Defaults</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
