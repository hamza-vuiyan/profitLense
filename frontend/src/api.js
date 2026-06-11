import axios from 'axios'

// In dev, Vite proxy forwards /api → http://localhost:8080
// In production, set VITE_API_BASE to the deployed backend URL
const BASE_URL = import.meta.env.VITE_API_BASE || ''

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300_000, // 5 min – Prophet can be slow on first run
  headers: { 'Content-Type': 'application/json' },
})

export async function runAnalysis(merchantId = null) {
  const params = merchantId ? { merchantId } : {}
  const { data } = await api.post('/api/analyze', null, { params })
  return data
}

export async function getAnalysis(merchantId = null) {
  const params = merchantId ? { merchantId } : {}
  const { data } = await api.get('/api/analyze', { params })
  return data
}

export async function getProducts() {
  const { data } = await api.get('/api/products')
  return data
}

export async function getHealth() {
  const { data } = await api.get('/actuator/health')
  return data
}

export async function getDocsConfig() {
  const { data } = await api.get('/api/docs/config')
  return data
}

export async function getDocsTeam() {
  const { data } = await api.get('/api/docs/team')
  return data
}

export async function getDocsMetrics() {
  const { data } = await api.get('/api/docs/live-metrics')
  return data
}

export async function getAdminConfig() {
  const { data } = await api.get('/api/admin/config')
  return data
}

export async function updateAdminConfig(configData) {
  const { data } = await api.post('/api/admin/config', configData)
  return data
}

export async function addTeamMember(memberData) {
  const { data } = await api.post('/api/admin/team', memberData)
  return data
}

export async function deleteTeamMember(id) {
  await api.delete(`/api/admin/team/${id}`)
}
