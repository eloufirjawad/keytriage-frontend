const DEV_DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'
const PROD_DEFAULT_API_BASE_URL = 'https://keytriage.aiechosystem.com'

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, '')

export const getApiBaseUrl = () => {
  const configuredPublic = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim()

  if (configuredPublic) {
    return normalizeBaseUrl(configuredPublic)
  }

  const configuredServer = (process.env.API_BASE_URL || '').trim()

  if (configuredServer) {
    return normalizeBaseUrl(configuredServer)
  }

  if (process.env.NODE_ENV === 'production') {
    return PROD_DEFAULT_API_BASE_URL
  }

  return DEV_DEFAULT_API_BASE_URL

}
