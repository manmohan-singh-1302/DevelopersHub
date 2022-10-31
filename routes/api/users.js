const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');

const User = require('../../models/User');
router.post('/',
[
    check('name','Name is required').notEmpty(),
    check('email', 'Please provide a valid email address').isEmail(),
    check('password', 'please enter a password of minimum 6 characters').isLength({min:6})

],
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.sendStatus(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try{

    // see if the user exists

    let user = await User.findOne({email});
    if(user){
        res.sendStatus(400).json({errors:[{msg: ' User already exists'}]        });
    } 

    // get users gravatar

    const avatar = normalise(gravatar.url(email,{
        s:'200',
        r: 'pg',
        d: 'mm'
    }),
    );

    user = new User({
        name,
        email,
        avatar,
        password
    });
    // encrypt the password

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();


    // return jsonwebtoken

    res.sendStatus('user Registered');
    }catch(err){
        console.log(err.message);
        res.sendStatus(500).send('Server error');
    }
});


module.exports = router;


