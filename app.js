const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config()
const { Schema } = mongoose;
const rawuserpage = fs.readFileSync(path.join(__dirname,'public','user.html'),'utf-8');
let copyuserpage = rawuserpage;
const port = process.env.PORT||8000;
const app = express();
app.use(express.json());
app.use(express.urlencoded());


main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
}

const userSchema = new Schema({
    name :{ type: String ,require:true},
    mobile : {type:Number , unique : [true,"this number is already registered"],require:true},
    password : {type: String ,require : true},
    age : {type :Number , min : 10 , max : 150},
    gender : {type:Boolean , require : true},
    incoming : {type : Object},
    outgoing : {type : Object},
    image : String,
    date : String,
    token : String
});

let isValidUser = false;
const User = mongoose.model('Users', userSchema);


// app.use(express.static(path.join(__dirname, "public")));
// app.use('/static', express.static('public/user.html'))

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','login.html'));
})
app.get('/signup',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','signup.html'))
})
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','login.html'))
})

app.post('/signup',(req,res)=>{
    console.log(req.body);
    var myData = new User(req.body);
    myData.date = new Date();
    if(req.body.gender == false){
        // console.log("male");
        myData.image = "https://cdn-icons-png.flaticon.com/128/4128/4128176.png";
    }else{
        // console.log("female");
        myData.image = "https://cdn-icons-png.flaticon.com/128/6997/6997662.png";
    }
    // console.log(myData);
    myData.save().then(()=>{
        res.redirect('/login');
    }).catch(()=>{
        res.status(400).send("failed to save");
    });
})
app.post('/login',async (req,res)=>{
    const umobile = req.body.mobile;
    const upassword = req.body.password;
    // console.log(umobile,upassword);
    try{

    
    let data = await User.findOne({ 
        $and : [{mobile : umobile} , { password : upassword}] 
        });
    console.log(data);
    if(data == null){
        console.log("invalid user");
        res.sendStatus(404);
    }else{
        console.log("valid user");
        isValidUser = true;
        copyuserpage = rawuserpage.replace(/\{userImage\}/g,data.image)
                                .replace(/\{userMobile\}/g,data.mobile)
                                .replace(/\{userName\}/g,data.name)
                                .replace(/\{userData\}/g,data)
        res.redirect(`/user`);
    }
}catch(e){
    console.log("error:",e)
}
});
app.use('/user',(req,res,next)=>{
    if(isValidUser){
        next();
    }else{
        res.sendStatus(404);
    }
});

app.get('/user',(req,res)=>{
    console.log("user loged in to its page");
    res.end(copyuserpage);
});

app.post('/user',async (req,res)=>{
    console.log("reqested for update");
    console.log(req.body);
    const senderMobile = req.body.sender;
    const receiverMobile = req.body.receiver;
    const msg = req.body.message;
    let receiver = await User.findOne({mobile : receiverMobile});
    let sender = await User.findOne({mobile:senderMobile});
    
    if(sender != undefined && receiver != undefined){

        if(sender['outgoing'] == undefined){
            await User.findOneAndUpdate({mobile : senderMobile},{outgoing : {}} ,{upsert:true});      
        }
        if(receiver['incoming'] == undefined){
            await User.findOneAndUpdate({mobile : receiverMobile},{incoming : {}} ,{upsert:true});      
        }
    
        receiver = await User.findOne({mobile : receiverMobile});
        // console.log(receiver)
        sender = await User.findOne({mobile : senderMobile});
        // console.log(sender)
    
        let receiverIncoming = receiver['incoming'];
        // console.log(receiverIncoming);
        let isSenderFound = false;
        let senderOutgoing = sender['outgoing'];
        // console.log(senderOutgoing);
        let isReceiverFound = false;
    
        for(let key in receiverIncoming){
            if(key == senderMobile){
                isSenderFound = true;
                let obj = {
                    message : msg,
                    time : new Date().getTime() 
                }
                receiverIncoming[key].push(obj);
                await User.findOneAndUpdate({mobile : receiverMobile} , {incoming : receiverIncoming});
                break;
            }
        }
        if(!isSenderFound){
            receiverIncoming[senderMobile] = [{
                message : msg,
                time : new Date().getTime() 
            }];
            await User.findOneAndUpdate({mobile : receiverMobile} , {incoming : receiverIncoming});
        }
    
        // for saving sender outgoing msg
        for(let key in senderOutgoing){
            if(key == receiverMobile){
                isReceiverFound = true;
                let obj = {
                    message : msg,
                    time : new Date().getTime() 
                }
                senderOutgoing[key].push(obj);
                await User.findOneAndUpdate({mobile : senderMobile} , {outgoing : senderOutgoing});
                break;
            }
        }
        if(!isReceiverFound){
            senderOutgoing[receiverMobile] = [{
                message : msg,
                time : new Date().getTime() 
            }];
            await User.findOneAndUpdate({mobile : senderMobile} , {outgoing : senderOutgoing});
        }
    }
})

app.get('/user/wurhwori32094jnfwmnr2u923vnf4i',async (req,res)=>{
    res.json(await User.find());
})

app.get('/sendNotification.mp3',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','sendNotification.mp3'));
})
app.get('/notification.mp3',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','notification.mp3'));
})

app.post('/clearMsg',async (req,res)=>{
    console.log("request for clearing chat");
    console.log(req.body);
    let firstPersonMobile = req.body.firstPersonMobile;
    let secondPersonMobile = req.body.secondPersonMobile;
    console.log(firstPersonMobile , "  " , secondPersonMobile);
    const firstPerson = await User.findOne({mobile : firstPersonMobile});

    let newincoming = firstPerson['incoming'];
    // console.log(newincoming);
    if(newincoming != undefined){
        let newincomingMsg = newincoming[secondPersonMobile];
        console.log(newincomingMsg);
        if(newincomingMsg != undefined){
            newincoming[secondPersonMobile] = [];
            console.log(newincoming);
            await User.findOneAndUpdate({mobile : firstPersonMobile},{incoming : newincoming});
        }
    }

    let newoutgoing = firstPerson['outgoing'];
    // console.log(newincoming);
    if(newoutgoing!= undefined){
        let newoutgoingMsg = newoutgoing[secondPersonMobile];
        console.log(newoutgoingMsg);
        if(newoutgoingMsg != undefined){
            newoutgoing[secondPersonMobile] = [];
            console.log(newoutgoing);
            await User.findOneAndUpdate({mobile : firstPersonMobile},{outgoing : newoutgoing});
        }
    }
});
app.get('/favicon.ico',(req,res)=>{
    res.send('https://cdn-icons-png.flaticon.com/128/1384/1384079.png');
})

app.listen(port,()=>{
    console.log(`server is running on port http://localhost:${port}`);
});
