const crypto = require('crypto');



module.exports = (str)=>{
	const hmac = crypto.createHmac('sha256', 'wangzhe');
	hmac.update(str);
	return hmac.digest('hex');
}