import { createContext, useContext, useState, useEffect, useCallback } from 'react'
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

  const [darkMode, setDarkModeState] = useState(() => {
    try {
      return localStorage.getItem('app_dark_mode') === 'true'
    } catch {
      return false
    }
  })

  const setCurrency = useCallback((code) => {
    setCurrencyState(code)
    try {
      localStorage.setItem('app_currency', code)
    } catch {}
  }, [])

  const setDarkMode = useCallback((val) => {
    setDarkModeState(val)
    try {
      localStorage.setItem('app_dark_mode', val ? 'true' : 'false')
    } catch {}
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
