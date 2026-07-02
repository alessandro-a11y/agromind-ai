import { useCallback, useEffect, useState } from 'react'

export function useAsync(loader, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await loader()
      setData(result)
      return result
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, refresh: run, setData }
}
