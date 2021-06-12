module.exports=func=>{
    return (req,res,next)=>{
        func(req,res,next).catch(next);
    }
}

//exporting a FUNCTION which takes func as argument and returns a NEW function that contions the execution of func