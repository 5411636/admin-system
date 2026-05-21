import request from '@/utils/request'

export const login = (data) => {
  return request.post('/auth/login', data)
}

export const getCurrentUser = () => {
  return request.get('/auth/me')
}

export const changePassword = (data) => {
  return request.put('/auth/password', data)
}