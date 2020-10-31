export default function (callback, time = 200) {
  let interval;

  return (...args) => {
  	clearTimeout(interval);

  	interval = setTimeout(() => {
  		interval = null;

  		callback(...args);
  	}, time);
  };  
}
