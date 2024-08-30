// import { NextFunction, Request, Response } from "express";
// import AdminUseCase from "../../use-case/adminUseCase";

// class AdminController {
//   private adminCase: AdminUseCase;

//   constructor(adminCase: AdminUseCase) {
//     this.adminCase = adminCase;
//   }

//   async login(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { email, password } = req.body;

//       const admin = await this.adminCase.adminLogin(email, password);

//       if (admin?.success) {
//         const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
//         res.cookie("adminToken", admin.token, {
//           expires: expiryDate,
//           httpOnly: true,
//           secure: true, // use true if you're serving over https
//           sameSite: 'none' // allows cross-site cookie usage
//         });
//         return res.status(200).json(admin);
//       }
//       return res.status(404).json(admin);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async logout(req: Request, res: Response, next: NextFunction) {
//     try {
//       res.cookie("adminToken", "", {
//         httpOnly: true,
//         expires: new Date(0),
//       });
//       res.status(200).json({ success: true });
//     } catch (error) {
//       next(error)
//     }
//   }

// //   async createAdmin(req: Request, res: Response, next: NextFunction) {
// //     try {
// //       const { name, email, password } = req.body;
// //       const admin = await this.adminCase.createAdmin(name, email, password);
// //       if (admin?.success) {
// //         return res.status(201).json(admin);
// //       }
// //       return res.status(400).json(admin);
// //     } catch (error) {
// //       next(error)
// //     }
// //   }

// }

// export default AdminController;

import { NextFunction, Request, Response } from "express";
import AdminUseCase from "../../use-case/adminUseCase";
import path from "path";
import fs from "fs";
import AppError from "../../infrastructure/utils/appError";


class AdminController {
  private adminCase: AdminUseCase;

  constructor(adminCase: AdminUseCase) {
    this.adminCase = adminCase;
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      const admin = await this.adminCase.adminLogin(email, password);

      if (admin?.success) {
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        res.cookie("adminToken", admin.token, {
          expires: expiryDate,
          httpOnly: true,
          secure: true, // use true if you're serving over https
          sameSite: 'none' // allows cross-site cookie usage
        });
        return res.status(200).json(admin);
      }
      return res.status(404).json(admin);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.cookie("adminToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error)
    }
  }


  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string ) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5

      const {users, total} = await this.adminCase.getAllUsers(page, limit);
      return res
        .status(200)
        .json({
          success: true,
          data: users,
          total,
          message: "Users list fetched",
        });
    } catch (error) {
        next(error)
    }
  }
  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userBlocked = await this.adminCase.blockUser(id);
      if (userBlocked) {
        res.status(200).json({ success: true });
      }
    } catch (error) {
        next(error)
    }
  }

  async getAllServiceProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5
      const {serviceProviders, total} = await this.adminCase.getAllServiceProviders(page, limit);
      return res
        .status(200)
        .json({
          success: true,
          data: serviceProviders,
          total,
          message: "ServiceProviders list fetched",
        });
    } catch (error) {
        next(error)
    }
  }

  async getServiceProviderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      console.log('id:',id);
      
      const serviceProvidersDetails = await this.adminCase.ServiceProviderDetails(id);
      return res
        .status(200)
        .json({
          success: true,
          data: serviceProvidersDetails,
          message: "ServiceProviders details fetched",
        });
    } catch (error) {
        next(error)
    }
  }

async approveServiceProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const serviceProviderAppproved = await this.adminCase.approveServiceProvider(id);
      if (serviceProviderAppproved) {
        res
          .status(200)
          .json({ success: true, message: "serviceProvider approved" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Failed to approve serviceProvider" });
      }
    } catch (error) {
        next(error)
    }
  }

  async blockProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const providerBlocked = await this.adminCase.blockProvider(id);
      if (providerBlocked) {
        res.status(200).json({ success: true });
      }
    } catch (error) {
        next(error)
    }
  }


  async addCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryName, subCategories } = req.body;

      if (!categoryName.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Categories name should not be empty" });
      }
      if (subCategories.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No Categories added" });
      }

      const categoryAdded = await this.adminCase.addCategory(categoryName, subCategories);
      if (categoryAdded?.success) {
        return res.status(201).json(categoryAdded);
      }
      return res.status(400).json(categoryAdded);
    } catch (error) {
      
      next(error)
    }
  }

  async findAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5
      const {categorys, total} = await this.adminCase.findAllCategories(page, limit);
      return res
        .status(200)
        .json({
          success: true,
          data: categorys,
          total,
          message: "categorys list fetched",
        });
    } catch (error) {
        next(error)
    }
  }

  async unlistCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const unlistCategory = await this.adminCase.unlistCategory(id);
      if (unlistCategory) {
        return res.status(200).json({ success: true, data: unlistCategory });
      }
    } catch (error) {
        next(error)
    }
  }

  async addBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const blogData = req.body;
      const file = req.file;
      console.log('Blog data:', blogData);
      console.log('Uploaded file:', file);
  
      if (!file) {
        throw new AppError("No file uploaded", 400);
      }
  
      const blog = await this.adminCase.addBlog(blogData, file);
  console.log('blog:',blog);
  
      // Optionally remove the file from the server if not needed
      const filePath = path.join(__dirname, "../../infrastructure/public/images", file.filename);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting the file from server", err);
        }
      });
  
      return res.status(201).json({ success: true, blog });
    } catch (error) {
      next(error);
    }
  }
  
  

  async listBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const { blogs, total } = await this.adminCase.listBlogs(page, limit);
      res.status(200).json({ success: true, blogs, total });
    } catch (error) {
      next(error);
    }
  }

  async unlistBlog(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('bl',req.params);
      
      const { id } = req.params;
      console.log('bl',id);

      const unlistBlog = await this.adminCase.unlistBlog(id);
      if (unlistBlog) {
        return res.status(200).json({ success: true, data: unlistBlog });
      }    } catch (error) {
      next(error);
    }
  }


  async updateBlogStatus(req: Request, res: Response ,next: NextFunction): Promise<void> {
    const { blogId } = req.params;
    const { isListed } = req.body;

    try {
        const updatedBlog = await this.adminCase.updateBlogStatus(blogId, isListed);
        res.status(200).json({ success: true, data: updatedBlog });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
}
  async addWebinar(req: Request, res: Response ,next: NextFunction): Promise<void> {
    try {
      console.log("body:",req.body, 'files:',req.files);
      
      const webinar = await this.adminCase.addWebinar(req.body, req.files);
      res.status(201).json(webinar);
    } catch (error) {
      res.status(500).json({ message: 'Failed to add webinar', error });
      next(error);

    }
  }

 

  async listWebinars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const webinars = await this.adminCase.listWebinars();
      res.status(200).json(webinars);
    } catch (error) {
      res.status(500).json({ message: 'Failed to list webinars', error });
      next(error);

    }
  }

  async unlistWebinar(req: Request, res: Response ,next: NextFunction): Promise<void> {
    try {
      console.log('parm',req.params);
      
      const { webinarId } = req.params;
      const webinar = await this.adminCase.unlistWebinar(webinarId);
      res.status(200).json(webinar);
    } catch (error) {
      res.status(500).json({ message: 'Failed to unlist webinar', error });
      next(error);

    }
  }


  async toggleWebinarListing(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
        const { id } = req.params; // This should match the parameter name in the route

        const webinar = await this.adminCase.toggleWebinarListing(id);
        if (!webinar) {
            return res.status(404).json({ success: false, message: 'Webinar not found' });
        }

        return res.json({ success: true, message: 'Webinar listing status updated', isListed: webinar.isListed });
    } catch (error) {
        console.error('Error toggling webinar listing:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


}

export default AdminController;
