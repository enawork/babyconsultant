/* global kintone */
import Swal from 'sweetalert2'
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai')
const { setLogLevel } = require('@azure/logger')

setLogLevel('info')
const PLUGIN_ID = kintone.$PLUGIN_ID
let config = kintone.plugin.app.getConfig(PLUGIN_ID)
config = config.config ? JSON.parse(config.config) : {}

const system = `あなたは、フィールド情報とユーザーからの指示を基にkintoneのカスタマイズを作成する優秀なプログラマーです。
説明などを出力せずにコードのみをstandard js styleで出力してください。`

const user = (appId, fields, order) => (`npmライブラリやjQueryなどは使用しないでください。
必ずフィールド情報にあるフィールドを使用してください。必ず存在しないフィールドを使わないでください。

フィールド情報:
${fields}

カスタマイズの指示:
${order}`);

(() => {
  kintone.events.on('app.record.detail.show', event => {
    // markdown
    // const spaceEl = kintone.app.record.getSpaceElement('marked')
    // spaceEl.innerHTML = marked.parse(event.record['結果'].value)
    // kintone.app.record.setFieldShown('結果', false)
    // spaceEl.classList.add('markdown-body')
    // ai
    const space = kintone.app.record.getSpaceElement('space')
    const executeButton = document.createElement('button')
    executeButton.innerText = '実行'
    executeButton.className = 'kintoneplugin-button-normal'
    space.insertAdjacentElement('beforeend', executeButton)
    executeButton.addEventListener('click', async () => {
      Swal.fire({
        title: 'カスタマイズを作成中です...',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: async () => {
          Swal.showLoading()
          try {
            const fieldsResult = await kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', { app: 259 })
            let fields = 'type,code,label\n'
            for (const key in fieldsResult.properties) {
              const obj = fieldsResult.properties[key]
              fields += `${obj.type},${obj.code},${obj.label}\n`
            }
            const messages = [
              { role: 'system', content: system },
              { role: 'user', content: user(event.appId, fields, event.record.指示.value) }
            ]
            const client = new OpenAIClient(config.endpoint, new AzureKeyCredential(config.apikey))
            const result = await client.getChatCompletions(config.deploymentId, messages, { maxTokens: 10000, temperature: 1, topP: 0.5 })
            let output = ''
            for (const choice of result.choices) {
              console.log(choice.message)
              output += choice.message.content
            }
            output = output.replace('```javascript', '')
            output = output.replace('```', '')

            await kintone.api(kintone.api.url('/k/v1/record.json', true), 'PUT', {
              app: event.appId,
              id: event.recordId,
              record: {
                結果: {
                  value: output
                }
              }
            })
            window.location.reload()
          } catch (error) {
            console.error(error)
            Swal.showValidationMessage(error.error.message)
            Swal.hideLoading()
          }
        }
      })
    })
    // 実装
    const createJsButton = document.createElement('button')
    createJsButton.innerText = '実装'
    createJsButton.className = 'kintoneplugin-button-normal'
    space.insertAdjacentElement('beforeend', createJsButton)
    return event
  })
})()
