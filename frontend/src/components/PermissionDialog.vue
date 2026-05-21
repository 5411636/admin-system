<template>
  <el-dialog
    v-model="visible"
    title="角色权限配置"
    width="600px"
    @close="handleClose"
  >
    <div class="role-info">
      <span>角色：</span>
      <el-tag type="primary">{{ currentRole?.name }}</el-tag>
      <el-tag type="info" style="margin-left: 10px">{{ currentRole?.code }}</el-tag>
    </div>

    <el-divider />

    <div v-loading="loading" class="permissions-tree">
      <el-tree
        ref="treeRef"
        :data="permissionTree"
        :props="treeProps"
        show-checkbox
        node-key="code"
        :default-checked-keys="checkedPermissions"
        @check="handleCheck"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <span class="node-label">{{ data.name }}</span>
            <el-tag size="small" type="info">{{ data.code }}</el-tag>
          </div>
        </template>
      </el-tree>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getPermissionList } from '@/api/permissions'
import { getRolePermissions, setRolePermissions } from '@/api/roles'
import { getModuleList } from '@/api/permissions'

const emit = defineEmits(['success'])

const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const currentRole = ref(null)
const treeRef = ref(null)

const allPermissions = ref([])
const checkedPermissions = ref([])

const treeProps = {
  children: 'children',
  label: 'name'
}

const permissionTree = computed(() => {
  const modules = [...new Set(allPermissions.value.map(p => p.module))]

  return modules.map(module => ({
    name: module,
    code: module,
    children: allPermissions.value.filter(p => p.module === module)
  }))
})

const open = async (role) => {
  visible.value = true
  currentRole.value = role

  await loadPermissions()
  await loadRolePermissions()
}

const loadPermissions = async () => {
  loading.value = true
  try {
    const res = await getPermissionList({ page: 1, pageSize: 1000 })
    allPermissions.value = res.data.list
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadRolePermissions = async () => {
  try {
    const res = await getRolePermissions(currentRole.value.id)
    checkedPermissions.value = res.data.map(p => p.code)
  } catch (error) {
    console.error(error)
  }
}

const handleCheck = (data, checkedInfo) => {
  checkedPermissions.value = checkedInfo.checkedKeys
}

const handleSave = async () => {
  saving.value = true
  try {
    await setRolePermissions(currentRole.value.id, checkedPermissions.value)
    ElMessage.success('权限设置成功')
    handleClose()
    emit('success')
  } catch (error) {
    console.error(error)
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  visible.value = false
  currentRole.value = null
  checkedPermissions.value = []
}

defineExpose({ open })
</script>

<style scoped>
.role-info {
  padding: 10px 0;
  font-size: 14px;
}

.permissions-tree {
  max-height: 400px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.node-label {
  font-size: 14px;
}
</style>