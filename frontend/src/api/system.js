import request from '@/utils/request'

export const getSettings = () => {
  return request.get('/system/settings')
}

export const updateSettings = (data) => {
  return request.put('/system/settings', data)
}

export const getLogs = (params) => {
  return request.get('/system/logs', { params })
}

export const clearLogs = () => {
  return request.delete('/system/logs')
}

export const exportLogs = () => {
  return request.get('/system/logs/export', { responseType: 'blob' })
}

export const getSystemInfo = () => {
  return request.get('/system/info')
}