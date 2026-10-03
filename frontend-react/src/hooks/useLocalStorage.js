import { useEffect, useState } from 'react'
import { readStorage, writeStorage } from '../services/storage.js'

function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => {
    const stored = readStorage(key, fallback)

    if (Array.isArray(fallback) && !Array.isArray(stored)) return fallback
    if (
      fallback === null &&
      stored !== null &&
      (typeof stored !== 'object' || Array.isArray(stored))
    ) {
      return fallback
    }

    return stored
  })

  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    setStorageError(!writeStorage(key, value))
  }, [key, value])

  return [value, setValue, storageError]
}

export default useLocalStorage