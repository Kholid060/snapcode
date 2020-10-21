<template>
	<div class="folders space-y-2">
		<div class="mb-3">
			<span class="text-lighter">Folders</span>
			<icon-ui class="float-right text-primary" name="mdiPlus"></icon-ui>
		</div>
		<card-ui class="w-full cursor-pointer" hover v-for="i in 13" :key="i">
	    <p class="text-white capitalize font-medium mb-1">
	    	some header
	    </p>
	    <p class="text-light leading-snug">
		    Lorem ipsum dolor sit amet, consectetur adipisicing elit,
	   	</p>
	   	<template #footer>
	   		<div class="text-lighter">
		   		<icon-ui name="document" class="mr-1 align-middle"></icon-ui>
		   		<span class="align-middle">5 Files</span>
		   	</div>
	   	</template>
	   </card-ui> 
	</div>
</template>
