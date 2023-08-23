/* global kintone */
import React from 'react'
import { createRoot } from 'react-dom/client'

const PLUGIN_ID = kintone.$PLUGIN_ID
let config = kintone.plugin.app.getConfig(PLUGIN_ID)
config = config.config ? JSON.parse(config.config) : {};

(() => {
  kintone.events.on('app.record.detail.show', event => {
    console.log(config)

    return event
  })
})()
