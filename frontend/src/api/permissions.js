import request from '@/utils/request'

export const getPermissionList = (params) => {
  return request.get('/permissions', { params })
}

export const getPermissionDetail = (id) => {
  return request.get(`/permissions/${id}`)
}

export const createPermission = (data) => {
  return request.post('/permissions', data)
}

export const updatePermission = (id, data) => {
  return request.put(`/permissions/${id}`, data)
}

export const deletePermission = (id) => {
  return request.delete(`/permissions/${id}`)
}

export const getModuleList = () => {
  return request.get('/permissions/modules/list')
}