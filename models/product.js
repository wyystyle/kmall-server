const mongoose = require('mongoose');
const pagination = require('../util/pagination.js');
		




const ProductSchema = new mongoose.Schema({
	  CategoryId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Category'
    },  
	  Sketch:{
	  	type:String
	  },
    images:{
      type:String
    },
    price:{
      type:Number
    },
    shopnum:{
      type:Number
    },
    details:{
      type:String 
    },
    states:{
      type:Number,
      default:0
    },
    order:{
      type:Number,
      default:0
    },
    name:{
      type:String
    } 		
},{
	timestamps:true
});
ProductSchema.statics.getPaginationProducts = function(page,query={}){
    return new Promise((resolve,reject)=>{
      let options = {
        page: page,//需要显示的页码
        model:this, //操作的数据模型
        query:query, //查询条件
        projection:'-__v', //投影，
        sort:{order:-1} //排序
      }
      pagination(options)
      .then((data)=>{
        resolve(data); 
      })
    })
 }

const ProductModel = mongoose.model('Product', ProductSchema);

module.exports =ProductModel;
