import { defineStore } from 'pinia'

type ModalType = 'success' | 'error'

type ModalState = {
  show: boolean
  message: string
  type: ModalType
}

export const useModalStore = defineStore('modal', {
  state: (): ModalState => ({
    show: false,
    message: '',
    type: 'success',
  }),
  actions: {
    open(message: string, type: ModalType = 'success') {
      this.message = message
      this.type = type
      this.show = true
    },
    close() {
      this.show = false
      this.message = ''
    },
  },
})
