// Simple client for fetching model run stats from OpenRouter (mocked for now)

export interface ModelRun {
  id: string
  model: string
  status: 'completed' | 'failed' | 'running'
  timestamp: string
  duration?: number
}

/**
 * Fetch recent model runs. Currently returns mock data.
 * Replace with a real API call when backend is ready.
 */
export async function getModelRuns(): Promise<ModelRun[]> {
  try {
    // Return mock data for now - can be replaced with real API calls later
    return [
      {
        id: '1',
        model: 'gpt-4',
        status: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        duration: 1200,
      },
      {
        id: '2',
        model: 'claude-3',
        status: 'completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        duration: 800,
      },
      {
        id: '3',
        model: 'llama-3',
        status: 'failed',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ]
  } catch (error) {
    console.error('Failed to fetch model runs:', error)
    return []
  }
}