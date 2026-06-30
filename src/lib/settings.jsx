import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { CURRENCIES, DEFAULT_CURRENCY, formatAmount } from './currency'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      return localStorage.getItem('app_currency') || DEFAULT_CURRENCY
    } catch {
      return DEFAULT_CURRENCY
    }
  })

  const themeTimerRef = useRef(null)

  const [darkMode, setDarkModeState] = useState(() => {
    try {
      const stored = localStorage.getItem('app_dark_mode')
      return stored === null ? true : stored === 'true'
    } catch {
      return true
    }
  })

  const setCurrency = useCallback((code) => {
    setCurrencyState(code)
    try {
      localStorage.setItem('app_currency', code)
    } catch {}
  }, [])

  const setDarkMode = useCallback((val) => {
    // Clear any pending timer from rapid toggles
    if (themeTimerRef.current) clearTimeout(themeTimerRef.current)

    // Add transition class for smooth theme switch
    document.documentElement.classList.add('theme-transition')

    setDarkModeState(val)
    try {
      localStorage.setItem('app_dark_mode', val ? 'true' : 'false')
    } catch {}

    // Remove transition class after animation completes
    themeTimerRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 350)
  }, [])

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const fAmount = useCallback((amount) => formatAmount(amount, currency), [currency])

  const currentCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]

  const getCurrencySymbol = useCallback(() => currentCurrency.symbol, [currentCurrency.symbol])

  return (
    <SettingsContext.Provider value={{
      currency,
      setCurrency,
      darkMode,
      setDarkMode,
      formatAmount: fAmount,
      getCurrencySymbol,
      currentCurrency,
      currencies: CURRENCIES,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
