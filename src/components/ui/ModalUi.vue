<template>
	<div class="modal-ui">
		<div class="modal-ui__activator" v-if="$slots.activator">
			<slot name="activator" v-bind="{ open: () => show = true }"></slot>
		</div>
		<teleport :to="teleportTo" :disabled="disabledTeleport">
			<transition name="modal" mode="out-in">
				<div
					class="bg-black p-5 overflow-y-auto bg-opacity-10 modal-ui__content-container z-50 flex justify-center items-end md:items-center"
					v-if="show"
					@click.self="closeModal"
				>
					<card-ui class="modal-ui__content shadow-lg w-full" :class="[contentClass]">
						<template #header>
							<div class="flex items-center justify-between">
								<span class="content-header">
									<slot name="header"></slot>
								</span>
							</div>
						</template>
						<slot></slot>
						<template #footer>
							<slot name="footer"></slot>
						</template>
					</card-ui>
				</div>
			</transition>
		</teleport>
	</div>
</template>
<script>
import { ref, watch, onMounted } from 'vue';
import CardUi from './CardUi.vue';

export default {
  components: { CardUi },
  props: {
    modelValue: {
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
  setup(props, { emit }) {
  	const show = ref(false);
  	const closeModal = () => {
  		if (props.persist) return;

  		show.value = false;
  		emit('close', false);
  		emit('update:modelValue', false);
  	};

	  onMounted(() => {
	  	const handleEsc = ({ code }) => {
	  		if (code === 'Escape') closeModal();
	  	};

	  	watch(() => props.modelValue, (value) => {
	  		show.value = value;
	  	}, { immediate: true });

	  	watch(show, (value) => {
	  		if (value) window.addEventListener('keyup', handleEsc);
	  		else window.removeEventListener('keyup', handleEsc);
	  	});
	  });

  	return {
  		show,
  		closeModal,
  	};
  },
};
</script>
<style src='~/assets/css/components/modal.css'></style>
