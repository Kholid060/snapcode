<template>
  <div class="modal-ui">
    <modal
     name="prompt"
     :width="360"
     height="auto"
     @before-open="modalHandler">
      <card-ui>
        <template slot="header">
          <p class="font-semibold">
            {{ params.title }}
          </p>
          <div class="flex-grow"></div>
          <button-ui icon plain small @click="hideModal">
            <v-mdi name="mdi-close"></v-mdi>
          </button-ui>
        </template>
        <input-ui
         block
         @keyup.enter.native="params.btn.handler(params.input)"
         :placeholder="params.placeholder"
         v-model="params.input"></input-ui>
        <div slot="footer" class="mt-3" align="right">
          <button-ui
           width="100px"
           class="mr-4"
           @click="hideModal"
           plain>Cancel</button-ui>
          <button-ui
           style="min-width: 100px"
           @click="params.btn.handler(params.input)"
           :type="params.btn.type"
           :disabled="!params.input">{{ params.btn.text }}</button-ui>
        </div>
      </card-ui>
    </modal>
    <modal
      name="confirm"
      :width="360"
      height="200px"
      @before-open="modalHandler">
      <card-ui>
        <template slot="header">
          <p class="font-semibold">
            {{ params.title }}
          </p>
          <div class="flex-grow"></div>
          <button-ui icon plain small @click="hideModal(params.name)">
            <v-mdi name="mdi-close"></v-mdi>
          </button-ui>
        </template>
        <p>{{ params.text }}</p>
        <div slot="footer" class="mt-3" align="right">
          <button-ui
           width="100px"
           class="mr-4"
           @click="hideModal"
           plain>Cancel</button-ui>
          <button-ui
           style="min-width: 100px"
           @click="params.btn.handler(params.input)"
           :type="params.btn.type">{{ params.btn.text }}</button-ui>
        </div>
      </card-ui>
    </modal>
  </div>
</template>
<script>
const defaultParams = {
  name: '',
  title: '',
  text: '',
  input: '',
  placeholder: '',
  btn: {
    type: 'primary',
    text: 'add',
    handler: null,
  },
};

export default {
  name: 'modal-ui',
  data: () => ({
    params: defaultParams,
  }),
  methods: {
    modalHandler({ name, params }) {
      this.params = defaultParams;
      const { btn } = params;

      this.params = {
        ...this.params,
        ...params,
        name,
        btn: {
          ...this.params.btn,
          ...btn,
        },
      };
    },
    hideModal() {
      this.$modal.hide(this.params.name);
    },
  },
  // render(h) {
  //   if(this.params.name === '') return;

  //   const cardHeader = h('template', {
  //     slot: 'header',
  //   }, [
  //     h('p', {
  //       staticClass: 'font-semibold',
  //     }, this.params.title),
  //     h('div', { staticClass: 'flex-grow' }),
  //     h('button-ui', {
  //       props: {
  //         icon: true,
  //         plain: true,
  //         small: true,
  //       },
  //       on: {
  //         click: this.hideModal,
  //       },
  //     }, h('v-mdi', {
  //       props: {
  //         name: 'mdi-close',
  //       },
  //     }))
  //   ])

  //   let cardContent;
  //   if (this.params.name === 'prompt') {
  //     cardContent = h('input-ui', {
  //       props: {
  //         block: true,
  //         value: this.params.input,
  //       },
  //       on: {
  //         input: (input) => this.params.input = input,
  //         keyup: ({ keyCode }) => {
  //           if(keyCode === 13) this.params.btn.handler(this.params.input);
  //         },
  //       },
  //     })
  //   } else if (this.params.name === 'confirm') {
  //     cardContent = h('p', this.params.text);
  //   }

  //   const cardFooter = h('div', {
  //     attrs: {
  //       align: 'right',
  //     },
  //     slot: 'footer',
  //     staticClass: 'mt-3',
  //   }, [
  //     h('button-ui', {
  //       props: {
  //         width: '100px',
  //         plain: true,
  //       },
  //       staticClass: 'mr-4',
  //       on: {
  //         click: this.hideModal,
  //       },
  //     }, 'Cancel'),
  //     h('button-ui', {
  //       props: {
  //         type: this.params.btn.type,
  //         disabled: !this.params.input && this.params.name === 'prompt',
  //       },
  //       style: {
  //         minWidth: '100px',
  //       },
  //       on: {
  //         click: this.params.btn.handler(this.params.input),
  //       },
  //     }, this.params.btn.text)
  //   ])
  //   return h('div', {
  //     staticClass: 'modal-ui',
  //   }, [
  //     h('modal', {
  //       on: {
  //         'before-open': this.modalHandler,
  //       },
  //       props: {
  //         name: 'prompt',
  //         width: 360,
  //         height: 'auto',
  //       },
  //     }, [
  //       h('card-ui', [
  //         cardHeader,
  //         cardContent,
  //         cardFooter
  //       ])
  //     ])
  //   ])
  // },
};
</script>
<style lang="scss">
.v--modal-box.v--modal, .vm--modal{
  background-color: transparent !important;
}
</style>
