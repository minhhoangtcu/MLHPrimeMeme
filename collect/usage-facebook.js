const CollectFacebook = require('./facebook-collect.js');

// insert access token
var collect = new CollectFacebook('EAACEdEose0cBAKXJTxVFuFu00wB0oQqSpEGBrYTi5Rf4u9GwAlw2Vi01m3p22oJ144VM0fNIBweRgHgEcgk3ZAfEFas4eLYvc6zxAZC1EN3TVwzlPK57xzZCRv8ZBVXO4FSypUdGFduqFn08SE2cpA7nrWCVv3QFOCBVSs0kgQZDZD');

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