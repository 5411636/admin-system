<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑权限' : '新增权限'"
    width="500px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="权限名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入权限名称" />
      </el-form-item>
      <el-form-item label="权限代码" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入权限代码，如: user:view"
          :disabled="isEdit"
        />
      </el-form-item>
      <el-form-item label="所属模块" prop="module">
        <el-select v-model="form.module" placeholder="请选择所属模块" allow-create filterable>
          <el-option
            v-for="mod in moduleOptions"
            :key="mod"
            :label="mod"
            :value="mod"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="权限描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入权限描述"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createPermission, updatePermission } from '@/api/permissions'
import { getModuleList } from '@/api/permissions'

const emit = defineEmits(['success'])

const visible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const currentPermission = ref(null)
const moduleOptions = ref([])

const isEdit = computed(() => !!currentPermission.value)

const form = reactive({
  name: '',
  code: '',
  module: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入权限代码', trigger: 'blur' },
    { pattern: /^[a-z:_]+$/, message: '权限代码格式不正确', trigger: 'blur' }
  ],
  module: [{ required: true, message: '请选择或输入所属模块', trigger: 'change' }],
  description: [{ required: true, message: '请输入权限描述', trigger: 'blur' }]
}

const loadModules = async () => {
  try {
    const res = await getModuleList()
    moduleOptions.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const open = (data = null) => {
  visible.value = true
  currentPermission.value = data

  if (data) {
    Object.assign(form, {
      name: data.name,
      code: data.code,
      module: data.module,
      description: data.description
    })
  } else {
    formRef.value?.resetFields()
  }
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  currentPermission.value = null
}

const handleConfirm = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) {
          await updatePermission(currentPermission.value.id, form)
          ElMessage.success('更新成功')
        } else {
          await createPermission(form)
          ElMessage.success('创建成功')
        }
        handleClose()
        emit('success')
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}

defineExpose({ open })

onMounted(() => {
  loadModules()
})
</script>