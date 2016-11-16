const CollectFacebook = require('./facebook-collect.js');

// insert access token
var collect = new CollectFacebook('');

collect.getPhotosInfo(5)
  .then((result) => {
    console.log('\n> Get Photos Info\n');
    console.log(result);
  })
  .catch((error) => {
  	console.log(error);
  });

collect.getPostsOfUser(5)
  .then((result) => {
    console.log('\n> Get Status Updates Info\n');
    console.log(result);
  })
  .catch((error) => {
  	console.log(error);
  });