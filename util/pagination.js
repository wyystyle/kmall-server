
// opations={
// 	page:
// 	model:
// 	query:
// 	projection:
// 	sort:

// }



function pagination(options){

	return new Promise((resolve,reject)=>{

		let page = 1;
		if(!isNaN(parseInt(options.page))){
			page = parseInt(options.page)
		}

		// let page = req.query.page || 1;
		

		if(page<=0){
			page = 1
		}
		let limit = 3;
		options.model.estimatedDocumentCount(options.query)
		.then((count)=>{
			let pages = Math.ceil(count / limit);
			if(page>pages){
				page = pages
			}
			if(pages == 0){
				page = 1;
			}
			let list = [];
			for(let i=1; i<=pages;i++){
				list.push(i);
			}


		let skip = (page-1)*limit;	

		let query = options.model.find(options.query,options.projection);

		
		if(options.populate){
			for(let i = 0; i<options.populate.length; i++){
				query = query.populate(options.populate[i])
			}
		}
			query
			 .sort(options.sort)
			 .skip(skip)	
			 .limit(limit)
			 .then((docs)=>{
			 	
			 	// console.log(docs)

			 	resolve({

			 		docs:docs,
			 		page:page,
			 		list:list,
			 		pages:pages

			 	})
			 })
		})
	});

}
module.exports = pagination;