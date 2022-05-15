const express=require('express')
var bodyParser=require('body-parser') //also add nodemon
const { ModelBuildPage } = require('twilio/lib/rest/autopilot/v1/assistant/modelBuild')
const { FunctionVersionContentContext } = require('twilio/lib/rest/serverless/v1/service/function/functionVersion/functionVersionContent')
const app=express()

var chainIDArray=[]
var tokenAddressArray=[]

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))

app.get("/",function(req,res){
    res.render("./form.ejs")
})

app.get("/result",function(req,res){
    module.exports.chainIDArray=chainIDArray
    module.exports.tokenAddressArray=tokenAddressArray
    console.log("exporting: "+chainIDArray.length)
    res.redirect("/")
})

app.post("/",function(req,res){
    var chainID=req.body.chain
    var tokenAddress=req.body.tokenAddress

    chainIDArray.push(chainID)
    tokenAddressArray.push(tokenAddress)
    // chainIDArray.push(chain)
    // tokenAddressArray.push(tokenAddress)
    // for(let i=0;i<tokenAddressArray.length;i++){
    //     //console.log("chain: "+chainIDArray[i]+" token: "+tokenAddressArray[i])
    // }
    res.redirect("result")
})

app.listen(3000,function(){
    console.log("Form Server is up and running");
})