<template>
	<button-group-ui class="divide-x">
		<popover-ui v-if="!isLocalFile">
			<button-ui icon v-tooltip.group="'Fork snippet'">
				<icon-ui name="mdiSourceFork"></icon-ui>
			</button-ui>
			<template #popover>
				<select-ui
					label="Select folder"
					:options="folders"
					item-label="name"
					item-value="id"
					v-model="selectedFolder"
				></select-ui>
				<button-ui
					block
					variant="primary"
					class="mt-4"
					:disabled="selectedFolder === ''"
					@click="forkSnippet"
          v-close-popover
				>
					Fork Snippet
				</button-ui>
			</template>
		</popover-ui>
		<button-ui icon @click="copyCode" v-tooltip.group="'Copy code'">
			<icon-ui name="clipboardCopy"></icon-ui>
		</button-ui>
	</button-group-ui>
</template>
<script>
import { onMounted, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useGroupTooltip } from '~/composable';
import { Folder, File } from '~/models';
import { copyToClipboard } from '~/utils/helper';

export default {
  props: {
    file: {
      type: Object,
      default: () => ({}),
    },
    isLocalFile: Boolean,
  },
  setup(props, { emit }) {
    const toast = useToast();
  	const folders = Folder.all();
  	const selectedFolder = ref(folders[0]?.id || '');

  	function copyCode() {
  		copyToClipboard(props.file.value.code);

      toast('Code copied', {
        timeout: 2000,
      });
    }
  	function forkSnippet() {
  		const copyFile = { ...props.file };

  		delete copyFile.id;

  		File.$create({
  			data: {
  				...copyFile,
          createdAt: Date.now(),
  				isEdited: true,
  				isNew: true,
  			},
  		}).then((file) => {
        emit('fork', file);
      });
  	}

  	onMounted(() => {
  		useGroupTooltip();
  	});

  	return {
  		folders,
  		copyCode,
  		forkSnippet,
  		selectedFolder,
  	};
  },
};
</script>
