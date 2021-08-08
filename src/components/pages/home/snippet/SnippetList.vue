<template>
  <list-transition>
    <div v-for="snippet in snippets" :key="snippet.id" class="list-item-transition">
      <router-link
        v-slot="{ navigate, href, isExactActive }"
        :to="`/view/${snippet.id}`"
        custom
        exact-active-class="bg-light text-primary"
      >
        <div
          class="py-4 px-5 border-b snippet block hover:bg-light group"
          :class="{ 'text-primary bg-light': isExactActive }"
        >
          <div class="mb-3 flex items-center">
            <v-mdi
              v-if="snippet.isShared"
              name="mdi-link-variant"
              size="18"
              class="text-primary mr-1"
            ></v-mdi>
            <a
              class="leading-tight text-overflow flex-1 pr-2 focus:text-primary"
              v-bind="{ href }"
              :title="snippet.name"
              @click="navigate"
            >
              {{ snippet.name }}
            </a>
            <v-mdi
              :name="snippet.starred ? 'mdi-star' : 'mdi-star-outline'"
              size="22"
              :class="[snippet.starred ? 'text-warning visible' : 'lg:invisible text-light']"
              class="group-hover:visible cursor-pointer"
              @click="updateFile(snippet.id, { starred: !snippet.starred })"
            ></v-mdi>
          </div>
          <a
            class="snippet__footer text-sm text-lighter flex items-center justify-between"
            v-bind="{ href }"
            @click="navigate"
          >
            <span class="flex-1 pr-2 text-overflow">
              {{ getLangInfo(snippet.language, 'name') || snippet.language }}
            </span>
            <span>{{ formatTime(snippet.createdAt) }}</span>
          </a>
        </div>
      </router-link>
    </div>
  </list-transition>
</template>
<script>
import dayjs from '~/lib/dayjs';
import { getLangInfo } from '~/utils/languages';
import { useStorage } from '~/composable';

export default {
  props: {
    snippets: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const storage = useStorage();

    function formatTime(time) {
      return dayjs(time).fromNow();
    }
    function updateFile(id, data) {
      storage.model('files').update({
        where: id,
        data: {
          ...data,
          isEdited: true,
        },
      });
    }

    return {
      updateFile,
      formatTime,
      getLangInfo,
    };
  },
};
</script>
