import 'reflect-metadata'
import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  it('mounts and renders tab shell', async () => {
    router.push('/timer')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Timer')
    expect(wrapper.text()).toContain('History')
    expect(wrapper.text()).toContain('Exports')
    expect(wrapper.text()).toContain('Settings')
  })
})
