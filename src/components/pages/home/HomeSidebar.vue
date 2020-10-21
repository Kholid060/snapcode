<template>
	<div class="bg-light h-full p-5 h-screen overflow-auto scroll">
		<div class="mb-6 library">
			<p class="mb-3 text-lighter">Library</p>
			<list-ui class="space-y-1">
				<list-item-ui small class="cursor-pointer hover:text-default">
					<template #prepend>
						<icon-ui name="archive"></icon-ui>
					</template>
					All snippets
				</list-item-ui>
				<list-item-ui small class="cursor-pointer hover:text-default">
					<template #prepend>
						<icon-ui name="star"></icon-ui>
					</template>
					Favorites
				</list-item-ui>
			</list-ui>
		</div>
		<div class="tags">
			<div class="flex items-center text-lighter justify-between mb-3">
				<p>Tags</p>
				<icon-ui 
					class="hover:text-white cursor-pointer" 
					name="mdiPlus"
					v-tooltip="'Add tag'"
				></icon-ui>
			</div>
			<list-ui>
				<list-item-ui small v-for="i in 15" :key="i">
					<template #prepend>
						<div class="h-3 w-3 rounded-lg bg-primary"></div>
					</template>
					what
				</list-item-ui>
			</list-ui>
		</div>
	</div>
</template>
