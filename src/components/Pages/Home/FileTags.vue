<template>
  <div class="mt-2">
    <tag-ui v-for="i in 4" :key="i" class="mr-2">
      halo {{i}}
    </tag-ui>
    <v-popover
     trigger="manual"
     :auto-hide="false"
     :open="openPopover"
     class="inline-block ml-2">
      <input
       class="h-8 focus:outline-none bg-transparent"
       placeholder="Enter tag..."
       type="text"
       v-model="search"
       @focus="openPopover = true"
       @blur="openPopover = false">
      <card-ui slot="popover" class="shadow-xl border">
        <list-ui v-if="filteredItems.length === 0">
          <p>
            Add <b>{{ search }}</b> as a tag
          </p>
        </list-ui>
        <template v-else>
          <list-ui
           dense
           v-for="item in filteredItems"
           :key="item">
            item-{{ item }}
          </list-ui>
        </template>
      </card-ui>
    </v-popover>
  </div>
</template>
<script>
export default {
  data: () => ({
    openPopover: false,
    test: ['1', '2', '3', '4', '5', '6', '7', '8'],
    search: '',
  }),
  computed: {
    filteredItems() {
      return this.test.filter((num) => num.match(this.search));
    },
  },
};
</script>
