import path from 'path'
import multer from 'multer'

const upload = multer({
    dest:"uploads/",
    limits:{ fileSize: 50*1024*1024}, //50 mb in size max limit 
    storage:multer.diskStorage({
        destination:"uploads/",
        filename:(req,file,cb)=>{
            cb(null,file.originalname);
        },
        }),
        fileFilter:(req,file,cb)=>{
            let ext = path.extname(file.originalname);  
            if(
                ext !== '.jpg' && 
                ext !== '.jpeg'  && 
                ext !== '.webp'&& 
                ext !== '.png'&&
                ext !== '.gif'&&
                ext !== '.svg'&&
                ext !== '.webp'){
                cb(new Error('File type is not supported'),false);
                return;
            }   
            cb(null,true);       
        }
})

export default upload;
