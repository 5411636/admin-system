import request from '@/utils/request'

export const getDashboardStats = () => {
  return request.get('/dashboard/stats')
}

export const getUserTrend = () => {
  return request.get('/dashboard/user-trend')
}

export const getVisitStats = () => {
  return request.get('/dashboard/visit-stats')
}

export const getSystemOverview = () => {
  return request.get('/dashboard/overview')
}