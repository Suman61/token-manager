const express=require('express')
const axios=require('axios')
const cheerio=require('cheerio')
const fetch=require('node-fetch')  //node-fetch@2.0.0
const { FunctionInstance } = require('twilio/lib/rest/serverless/v1/service/function')

var chainIDArray=[]
var tokenAddressArray=[]

 console.log("API script started")

//----------------------------------------------------------------------------------------------------------------

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = require("./key-info").token

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const covalentAPIKey=require("./key-info").covalentAPIKey
const apiEndpointBase='https://api.covalenthq.com/v1'

const desiredPercentageChange=0  

var listSize='10000000'                                                 //total size of the JSON data list fetched from API

var tokenHoldersArray=[]                                                //Number of token holders of all the tokens

const chatID=require("./key-info").chatID

function sendAlert(change, percentageDifferenceOfHolders, lastAmount, currentAmount){
    
    let message = "*** " + change +" ***\n" + "Percentage Change = " +percentageDifferenceOfHolders + 
                  "\nLast Amount = " + lastAmount + "\n" +"Current Amount = " + currentAmount

    bot.sendMessage(chatID,message)

    console.log("Message Sent: " + message)

}



async function numberOfHolders(apiEndpoint) {
    var holders=0
    return fetch(apiEndpoint)
    .then(function(response){
        return response.json()
    })
    .then(function(data){
        try{
            holders=data.data.items.length
            console.log("API Called")
            return holders

        }catch(err){
            console.log("error: "+err)
        }        
    })
}

//----------------------------------------------------------------------------------------------------------------------------

async function main(){

    console.log("API main function reached")

    chainIDArray=require("./app").chainIDArray
    tokenAddressArray=require("./app").tokenAddressArray

    if(chainIDArray != undefined || tokenAddressArray != undefined){
        var totalTokens=tokenAddressArray.length

        for(let index=0 ; index < totalTokens ; index++){
            console.log("Entered loop")

            const chainID="/"+chainIDArray[index]
            const tokenAddress="/"+tokenAddressArray[index]

            const apiEndpoint=apiEndpointBase+chainID+'/tokens'+tokenAddress+
                              '/token_holders/?quote-currency=USD&format=JSON&page-size='+
                              listSize+'&page-number=0&key='+covalentAPIKey

            console.log("API Endpoint: "+ apiEndpoint)
    
            var totalHoldersOfCurrentToken=await numberOfHolders(apiEndpoint) 

            console.log("API Endpoint: "+apiEndpoint)
            console.log("total holders of current token: "+totalHoldersOfCurrentToken)

            if(tokenHoldersArray.length < totalTokens)  tokenHoldersArray.push(totalHoldersOfCurrentToken) 
            else{

                var percentageDifferenceOfHolders = (( totalHoldersOfCurrentToken - tokenHoldersArray[index])/tokenHoldersArray[index])*100
                if(Math.abs(percentageDifferenceOfHolders) >= desiredPercentageChange){

                    let change=""

                    if(percentageDifferenceOfHolders < 0) change="DECREASE"
                    else    change="INCREASE"

                    sendAlert(change, percentageDifferenceOfHolders, tokenHoldersArray[index], totalHoldersOfCurrentToken)

                }

                tokenHoldersArray[index] = totalHoldersOfCurrentToken //temporary statement

            }

        }
    }
    
    
}

//----------------------------------------------------------------------------------------------------------------------------------

 setInterval(main,1000*5)