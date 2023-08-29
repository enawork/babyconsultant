/* global kintone */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Button, Stack, TextField } from '@mui/material'

const PLUGIN_ID = kintone.$PLUGIN_ID
const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID)
CONFIG.config = CONFIG.config ? JSON.parse(CONFIG.config) : {}

const Config = () => {
  const [config, setConfig] = React.useState(CONFIG.config)
  console.log(config)

  const handleChange = (propName, value) => {
    setConfig({ ...config, [propName]: value })
  }

  const handleSave = () => {
    kintone.plugin.app.setConfig({ config: JSON.stringify(config) })
  }

  return (
    <Stack spacing={1}>
      <Stack direction='row'>
        <Button variant='contained' onClick={handleSave}>保存</Button>
      </Stack>
      <Stack direction='row'>
        <TextField type='text' size='small' label='endpoint' value={config.endpoint} onChange={e => handleChange('endpoint', e.target.value)} />
        <TextField type='text' size='small' label='apikey' value={config.apikey} onChange={e => handleChange('apikey', e.target.value)} />
        <TextField type='text' size='small' label='deploymentId' value={config.deploymentId} onChange={e => handleChange('deploymentId', e.target.value)} />
      </Stack>
    </Stack>
  )
}

(() => {
  const div = document.getElementById('plugin-config-root')
  if (!div) {
    return
  }
  const root = createRoot(div)
  root.render(<Config />)
})()
