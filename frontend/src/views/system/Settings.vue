<template>
  <div class="settings-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="120px"
            class="settings-form"
          >
            <el-form-item label="站点名称" prop="siteName">
              <el-input v-model="form.siteName" placeholder="请输入站点名称" />
            </el-form-item>

            <el-form-item label="站点Logo" prop="siteLogo">
              <el-input v-model="form.siteLogo" placeholder="请输入站点Logo地址" />
            </el-form-item>

            <el-form-item label="系统邮箱" prop="systemEmail">
              <el-input v-model="form.systemEmail" placeholder="请输入系统邮箱" />
            </el-form-item>

            <el-form-item label="维护模式" prop="maintenance">
              <el-switch v-model="form.maintenance" />
              <span class="form-tip">开启后系统将进入维护模式，普通用户无法访问</span>
            </el-form-item>

            <el-form-item label="开放注册" prop="allowRegistration">
              <el-switch v-model="form.allowRegistration" />
              <span class="form-tip">开启后允许用户自主注册账号</span>
            </el-form-item>

            <el-form-item label="会话超时" prop="sessionTimeout">
              <el-input-number
                v-model="form.sessionTimeout"
                :min="5"
                :max="1440"
                :step="5"
              />
              <span class="form-tip">分钟</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="loading" @click="handleSave">
                保存设置
              </el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="24">
        <el-card shadow="hover" style="margin-top: 20px">
          <template #header>
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>系统信息</span>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统版本">{{ systemInfo.version }}</el-descriptions-item>
            <el-descriptions-item label="Node版本">{{ systemInfo.nodeVersion }}</el-descriptions-item>
            <el-descriptions-item label="运行平台">{{ systemInfo.platform }}</el-descriptions-item>
            <el-descriptions-item label="系统架构">{{ systemInfo.architecture }}</el-descriptions-item>
            <el-descriptions-item label="运行时间">{{ formatUptime(systemInfo.uptime) }}</el-descriptions-item>
            <el-descriptions-item label="运行环境">{{ systemInfo.environment }}</el-descriptions-item>
            <el-descriptions-item label="内存使用">
              {{ systemInfo.memory?.used }} / {{ systemInfo.memory?.total }}
            </el-descriptions-item>
            <el-descriptions-item label="RSS内存">
              {{ systemInfo.memory?.rss }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSettings, updateSettings, getSystemInfo } from '@/api/system'

const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  siteName: '',
  siteLogo: '',
  systemEmail: '',
  maintenance: false,
  allowRegistration: false,
  sessionTimeout: 30
})

const rules = {
  siteName: [{ required: true, message: '请输入站点名称', trigger: 'blur' }],
  systemEmail: [
    { required: true, message: '请输入系统邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  sessionTimeout: [{ required: true, message: '请输入会话超时时间', trigger: 'blur' }]
}

const systemInfo = ref({
  version: '-',
  nodeVersion: '-',
  platform: '-',
  architecture: '-',
  uptime: 0,
  memory: {},
  environment: '-'
})

let originalForm = null

const formatUptime = (seconds) => {
  if (!seconds) return '-'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}天 ${hours}小时 ${minutes}分钟`
}

const loadData = async () => {
  try {
    const res = await getSettings()
    Object.assign(form, res.data)
    originalForm = JSON.parse(JSON.stringify(res.data))
  } catch (error) {
    console.error(error)
  }
}

const loadSystemInfo = async () => {
  try {
    const res = await getSystemInfo()
    systemInfo.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const handleSave = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await updateSettings(form)
        ElMessage.success('保存成功')
        originalForm = JSON.parse(JSON.stringify(form))
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleReset = () => {
  if (originalForm) {
    Object.assign(form, originalForm)
  }
}

onMounted(() => {
  loadData()
  loadSystemInfo()
})
</script>

<style scoped>
.settings-page {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.settings-form {
  max-width: 600px;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 13px;
}
</style>