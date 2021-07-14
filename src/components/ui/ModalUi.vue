<template>
  <div class="modal-ui">
    <div v-if="$slots.activator" class="modal-ui__activator">
      <slot name="activator" v-bind="{ open: () => (show = true) }"></slot>
    </div>
    <teleport :to="teleportTo" :disabled="disabledTeleport">
      <transition name="modal" mode="out-in">
        <template v-if="show">
          <slot v-if="customContent"></slot>
          <div
            v-else
            class="
              bg-black
              p-5
              overflow-y-auto
              bg-opacity-50
              modal-ui__content-container
              flex
              justify-center
              items-end
              md:items-center
            "
            style="z-index: 9999"
            @click.self="closeModal"
          >
            <card-ui class="modal-ui__content shadow-lg w-full" :class="[contentClass]">
              <template #header>
                <div class="flex items-center justify-between">
                  <span class="content-header">
                    <slot name="header"></slot>
                  </span>
                  <v-mdi
                    v-show="!persist"
                    class="text-lighter cursor-pointer"
                    name="mdi-close"
                    size="20"
                    @click="closeModal"
                  ></v-mdi>
                </div>
              </template>
              <slot></slot>
              <template #footer>
                <slot name="footer"></slot>
              </template>
            </card-ui>
          </div>
        </template>
      </transition>
    </teleport>
  </div>
</template>
<script>
import { ref, watch } from 'vue';
import CardUi from './CardUi.vue';

export default {
  components: { CardUi },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    customContent: {
      type: Boolean,
      default: false,
    },
    teleportTo: {
      type: String,
      default: '#popup-container',
    },
    contentClass: {
      type: String,
      default: 'max-w-lg',
    },
    persist: Boolean,
    disabledTeleport: Boolean,
  },
  emits: ['close', 'update:modelValue'],
  setup(props, { emit }) {
    const show = ref(false);

    function closeModal() {
      if (props.persist) return;

      show.value = false;
      emit('close', false);
      emit('update:modelValue', false);
    }
    function handleEsc({ code }) {
      if (code === 'Escape') closeModal();
    }

    watch(
      () => props.modelValue,
      (value) => {
        show.value = value;
      },
      { immediate: true }
    );
    watch(show, (value) => {
      if (value) {
        window.addEventListener('keyup', handleEsc);
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
        window.removeEventListener('keyup', handleEsc);
      }
    });

    return {
      show,
      closeModal,
    };
  },
};
</script>
<style src='~/assets/css/components/modal.css'></style>
