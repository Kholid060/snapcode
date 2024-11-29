<template>
  <span
    :contenteditable="state.isFocus"
    @pointerdown="handlePointerDown"
    class="ui-editable focus:ring-offset-background focus:ring-ring relative whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-offset-2"
    :data-placholder="state.hasValue ? '' : placeholder"
    :style="{ cursor: state.isFocus ? 'auto' : 'default' }"
    @input="handleInput"
    @blur="handleBlur"
    @keydown="handleKeydown"
    @keydown.esc="
      resetState();
      ($event.target as HTMLElement).blur();
    "
  >
    {{ value }}
  </span>
</template>
<script setup lang="ts">
interface SubmitEvent {
  value: string;
  isDirty: boolean;
}

const props = defineProps<{
  value: string;
  placeholder?: string;
}>();
const emit = defineEmits<{
  update: [value: string];
  submit: [event: SubmitEvent];
}>();

const state = shallowReactive({
  isFocus: false,
  isDirty: false,
  hasValue: Boolean(props.value),
});

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  switch (event.key) {
    case 'Esc':
    case 'Enter':
      target.blur();
      break;
  }
}
function resetState() {
  state.isDirty = false;
  state.isFocus = false;
}
function handleBlur(event: FocusEvent) {
  const value = (event.target as HTMLElement).textContent!;
  emit('submit', { value, isDirty: state.isDirty });
  resetState();
}
function handleInput(event: Event) {
  const value = (event.target as HTMLElement).textContent!;
  state.hasValue = Boolean(value);
  state.isDirty = true;

  emit('update', value);
}
function handlePointerDown(event: PointerEvent) {
  if (state.isFocus) return;

  state.isDirty = false;
  state.isFocus = true;
  event.preventDefault();

  nextTick(() => {
    (event.target as HTMLElement).focus();

    if ('caretRangeFromPoint' in document) {
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);
      if (!range) return;

      const selection = document.getSelection();
      if (!selection) return;

      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
}
</script>
<style lang="postcss" scoped>
.ui-editable {
  &::before {
    content: attr(data-placholder);
    left: 0;
    top: 50%;
    opacity: 0.75;
    position: absolute;
    white-space: nowrap;
    pointer-events: none;
    transform: translateY(-50%);
  }
}
</style>
