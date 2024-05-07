import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import LayoutModel, { Layout } from "../models/layout.model";

export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      const isTypeExist = await LayoutModel.findOne({type});
      if(isTypeExist){
        return next(new ErrorHandler(`${type} already exist`,400));
      }

      if (type === "Banner") {
        const { image, title, subTitle } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "layout",
        });

        const banner = {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };

        await LayoutModel.create({ type, banner});
      }

      if (type === "FAQ") {
        await LayoutModel.create(req.body);
      }

      if (type === "categories") {
        await LayoutModel.create(req.body);
      }

      res.status(200).json({
        success: true,
        message: "Layout created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error?.message, 500));
    }
  }
);

export const editLayout = CatchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
    try{
        const { type } = req.body;

        const typeData:(Layout | null) = await LayoutModel.findOne({type});

        if(!type) return next(new ErrorHandler(`type doesn't exist`,400));

        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            if(typeData?.banner?.image?.public_id){
                await cloudinary.v2.uploader.destroy(typeData.banner.image.public_id);
            }

            const myCloud = await cloudinary.v2.uploader.upload(image, {
              folder: "layout",
            });
    
            const banner = {
              image: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
              },
              title,
              subTitle,
            };
    
            await LayoutModel.findByIdAndUpdate(typeData?._id,{ type, banner});
          }
    
          if (type === "FAQ") {
            await LayoutModel.findByIdAndUpdate(typeData?._id,req.body);
          }
    
          if (type === "categories") {
            await LayoutModel.findByIdAndUpdate(typeData?._id,req.body);
          }
    
          res.status(200).json({
            success: true,
            message: "Layout updated successfully",
          });
    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
})

export const getLayoutByType = CatchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
    try{
        const layout = await LayoutModel.findOne({type:req.params.type});
        res.status(200).json({
            success:true,
            layout
        })
    }catch(error:any){
        return next(new ErrorHandler(error.message,500));
    }
})