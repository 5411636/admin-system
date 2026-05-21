import request from '@/utils/request'

export const getRoleList = (params) => {
  return request.get('/roles', { params })
}

export const getRoleDetail = (id) => {
  return request.get(`/roles/${id}`)
}

export const createRole = (data) => {
  return request.post('/roles', data)
}

export const updateRole = (id, data) => {
  return request.put(`/roles/${id}`, data)
}

export const deleteRole = (id) => {
  return request.delete(`/roles/${id}`)
}

export const getRolePermissions = (id) => {
  return request.get(`/roles/${id}/permissions`)
}

export const setRolePermissions = (id, permissions) => {
  return request.put(`/roles/${id}/permissions`, { permissions })
}