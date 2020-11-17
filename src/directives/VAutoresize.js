export default {
  mounted(el) {
  	el.setAttribute('style', `height: ${el.scrollHeight}; overflow-y: hidden`);
  	el.addEventListener('input', () => {
	  	/* eslint-disable-next-line */
  		el.style.height = 'auto';
	  	/* eslint-disable-next-line */
  		el.style.height = `${el.scrollHeight}px`;
  	});
  },
};
