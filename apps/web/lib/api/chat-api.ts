interface SendMessageResponse {
  response: string
  success: boolean
  error?: string
  agentId?: string
}

export async function sendMessage(message: string, agentId?: string): Promise<SendMessageResponse> {
  try {
    const response = await fetch('http://localhost:3030/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: message,
        ...(agentId ? { agentId } : {}),
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return {
      response: data.output || data.response || data.message || 'No response received',
      agentId: data.agentId,
      success: true,
    }
  } catch (error) {
    console.error('Error sending message:', error)
    return {
      response: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function sendStreamingMessage(
  message: string,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
  agentId?: string,
): Promise<void> {
  try {
    const response = await fetch('http://localhost:3030/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: message,
        ...(agentId ? { agentId } : {}),
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No response body')
    }

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)

          if (data === '[DONE]') {
            continue
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch {
            // Skip invalid JSON chunks
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }
    console.error('Error in streaming message:', error)
    throw error
  }
}