import 'reflect-metadata'
import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  it('mounts and renders tab shell', async () => {
    router.push('/profiles')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Profiles')
    expect(wrapper.text()).toContain('History')
    expect(wrapper.text()).toContain('Overview')
  })
})
