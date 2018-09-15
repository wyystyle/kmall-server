//数据模板
const ProductModel = require('./product.js');
const mongoose = require('mongoose');
const pagination = require('../util/pagination.js');
const ProductSchema = new mongoose.Schema({
  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Product'
  },
  price:{
    type:Number
  },
  name:{
    type:String
  },
  images:{
    type:String
  },
  count:{
    type:Number,
    default:0
  },
  totalPrice:{
    type:Number,
    default:0
  }
});


const ShippingSchema = new mongoose.Schema({
  shippingId:{
    type:String
  },
  name:{
    type:String
  },
  province:{
    type:String
  },
  city:{
    type:String
  },
  address:{
    type:String
  },
  phone:{
    type:Number
  },
  zip:{
    type:Number
  }
})    	

const OrderSchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  orderNo:{
  	type:String
  },
  //支付金额
  payment:{
  	type:Number
  },
  paymentType:{
  	type:String,
    enum:["10","20"], //10代表支付宝 20微信
    default:"10"
  },
  paymentTypeDesc:{
    type:String,
    enum:["支付宝","微信"],
    default:"支付宝"
  },
  paymentTime:{
    type:Date
  },
  status:{
    type:String,
    enum:["10","20","30","40","50"],//10未支付 20 取消 30 已支付 40 已发货 50 完成
    default:"10"
  },
  statusDesc:{
    type:String,
    enum:["未支付","取消","已支付","已发货","完成"],//10未支付 20 取消 30 已支付 40 已发货 50 完成
    default:"未支付"
  },
  //配送信息
  shipping:{
    type:ShippingSchema
  },
  //商品信息
  productList:{
    type:[ProductSchema]
  },
},{
  timestamps:true
});


OrderSchema.statics.getPaginationProducts = function(page,query={},projection="",sort={_id:-1}){
    return new Promise((resolve,reject)=>{
      let options = {
        page: page,//需要显示的页码
        model:this, //操作的数据模型
        query:query, //查询条件
        projection:projection, //投影，
        sort:sort //排序
      }

      pagination(options)
      .then((data)=>{
        resolve(data); 
      })
    })
 }
/*OrderSchema.methods.getOrderProductList = function(){
  return new Promise((resolve,reject)=>{
    if(!this.cart){
      resolve({
        cartList:[]
      })
    }
    let getCartItem = this.cart.cartList.map(cartItem=>{
      return ProductModel
          .findById(cartItem.product,"name shopnum price images _id")
          .then(product=>{
            cartItem.product = product;
            cartItem.totalPrice =  product.price * cartItem.count;
            return cartItem
          })
    })
    Promise.all(getCartItem)
    .then(cartItems=>{
      let totalCartPrice = 0;
        cartItems.forEach(item=>{
          if(item.checked){
            totalCartPrice += item.totalPrice;
          }
        })
        this.cart.totalCartPrice = totalCartPrice;
        this.cart.cartList = cartItems;
        let hasNotCheckedItem = cartItems.find((item)=>{
          return item.checked == false;
        })
        if(hasNotCheckedItem){
          this.cart.allChecked = false;
        }else{
          this.cart.allChecked = true;
        }
        resolve(this.cart)
    })
    
  })
}

OrderSchema.methods.getOrderProduct = function(){
  return new Promise((resolve,reject)=>{
    if(!this.cart){
      resolve({
        cartList:[]
      })
    }
    let checkedList = this.cart.cartList.filter(cartItem=>{
      return cartItem.checked;
    })
    let getCartItem = this.cart.checkedList.map(cartItem=>{
      return ProductModel
          .findById(cartItem.product,"name shopnum price images _id")
          .then(product=>{
            cartItem.product = product;
            cartItem.totalPrice =  product.price * cartItem.count;
            return cartItem
          })
    })
    Promise.all(getCartItem)
    .then(cartItems=>{
      let totalCartPrice = 0;
        cartItems.forEach(item=>{
          if(item.checked){
            totalCartPrice += item.totalPrice;
          }
        })
        this.cart.totalCartPrice = totalCartPrice;
        this.cart.cartList = cartItems;
        resolve(this.cart)
    })
    
  })
}
*/


const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;
