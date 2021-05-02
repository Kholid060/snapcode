<template>
  <transition-group name="snippet-list">
    <div v-for="snippet in snippets" :key="snippet.id" class="snippet-container">
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
            <icon-ui
              v-if="snippet.isShared"
              name="link"
              size="18"
              class="text-primary mr-1"
            ></icon-ui>
            <a
              class="leading-tight text-overflow flex-1 pr-2 focus:text-primary"
              v-bind="{ href }"
              :title="snippet.name"
              @click="navigate"
              >{{ snippet.name }}</a
            >
            <icon-ui
              :name="snippet.starred ? 'starSolid' : 'star'"
              size="22"
              :class="[snippet.starred ? 'text-warning visible' : 'lg:invisible text-light']"
              class="group-hover:visible cursor-pointer"
              @click="updateFile(snippet.id, { starred: !snippet.starred })"
            ></icon-ui>
          </div>
          <a
            class="snippet__footer text-sm text-lighter flex items-center justify-between"
            v-bind="{ href }"
            @click="navigate"
          >
            <span>{{ snippet.language }}</span>
            <span>{{ formatTime(snippet.createdAt) }}</span>
          </a>
        </div>
      </router-link>
    </div>
  </transition-group>
</template>
<script>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { File } from '~/models';

dayjs.extend(relativeTime);

export default {
  props: {
    snippets: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    function formatTime(time) {
      return dayjs(time).fromNow();
    }
    function updateFile(id, data) {
      File.$update({
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
    };
  },
};
</script>
