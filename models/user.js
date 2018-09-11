//数据模板
const ProductModel = require('./product.js');
const mongoose = require('mongoose');
const CartItemSchema = new mongoose.Schema({
  product:{
    type:mongoose.Schema.Type.ObjectId,
    ref:'product'
  },
  count:{
    type:Number,
    default:0
  },
  totalPrice:{
    type:Number,
    default:0
  },
  checked:{
    type:Boolean,
    default:true
  }
});

const CartSchema = new mongoose.Schema({
  cartList:{
    type:[CartItemSchema]
  },
  allChecked:{
    type:Boolean,
    default:true
  },
  totalCartPrice:{
    type:Number,
    default:0
  }
})		

const UserSchema = new mongoose.Schema({

  username:{
  	type:String
  },
  password:{
  	type:String
  },
  isAdmin:{
  	type:Boolean,
  	default:true//默认是普通用户
  },
  email:{
    type:String
  },
  phone:{
    type:String
  },
  cart:{
    type:CartSchema
  }
},{
  timestamps:true
});
UserSchema.methods.getCart = function(){
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
    
    
  })
}


const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
