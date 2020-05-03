<template>
  <div
   v-on="$listeners"
   class="book-card rounded-lg p-2 cursor-pointer inline-block">
    <img-ui
     :title="book.title"
     :src="book.imgCover"
     position="top"
     width="110px"
     class="rounded-md overflow-hidden mx-auto shadow-xl"
     height="150px">
        <router-link
         :to="`/viewer?listId=${book.listId}&bookId=${book.id}`"
         class="img-content p-2 h-full z-0 rounded-md"></router-link>
        <button-ui
         icon
         small
         title="Delete book"
         class="float-right mr-2 z-10 mt-2"
         @click="delBook(book)">
          <v-mdi
           name="mdi-delete"
           class="text-danger"></v-mdi>
        </button-ui>
     </img-ui>
    <router-link
     :title="book.title"
     class="mt-2 text-overflow capitalize block"
     :to="`/viewer?listId=${book.listId}&bookId=${book.id}`">
      {{book.title}}
    </router-link>
    <router-link
     :to="`/author?name=${book.author}`"
     :title="book.author"
     class="capitalize text-overflow block text-lighter"
     >{{book.author}}</router-link>
  </div>
</template>
<script>
export default {
  name: 'book-card',
  props: {
    book: {
      type: Object,
      default: () => ({
        image: '',
        title: '',
        author: '',
        id: '',
      }),
    },
  },
  methods: {
    delBook({ listId, id }) {
      this.$store.commit('books/delBook', {
        listId,
        bookId: id,
      });
    },
  },
};
</script>
<style lang="scss">
.book-card{
  width: 140px;
  transition: background-color .1s ease;
  .img-ui{
    position: relative;
    .img-content{
      height: 100%;
      width: 100%;
      transition: background-color .2s ease;
      position: absolute;
    }
    .button-ui{
      transition: transform .4s cubic-bezier(0.6, -0.01, 0, 1.05);
      transform: translateX(45px);
    }
  }
  &:hover{
    .img-content{
      background-color: rgba(0, 0, 0, 0.6);
    }
    .button-ui{
      z-index: 1;
      transform: translateX(0);
    }
  }
}
</style>
