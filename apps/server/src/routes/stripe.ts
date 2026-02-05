import { listProductsSchema } from "@/schemas/stripe";
import { Router } from "express";
import { stripeService } from "../services/stripe";

export const stripeRouter: Router = Router();

stripeRouter.get("/products", async (req, res, next) => {
  try {
    const validatedQuery = listProductsSchema.parse(req.query);

    const products = await stripeService.listProducts({
      active: validatedQuery.active,
      limit: validatedQuery.limit,
    });

    res.json({
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
});

// stripeRouter.get("/prices", protectRoute, async (req, res, next) => {
//   try {
//     const validatedQuery = listPricesSchema.parse(req.query);

//     const prices = await stripeService.listPrices({
//       product: validatedQuery.product,
//       active: validatedQuery.active,
//       limit: validatedQuery.limit,
//     });

//     res.json({
//       data: prices,
//       count: prices.length,
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// stripeRouter.get("/products/:id", protectRoute, async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       throw new AppError(400, "INVALID_PRODUCT_ID", "Product ID is required");
//     }

//     const product = await stripeService.getProduct(id as string);

//     res.json({
//       data: product,
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// stripeRouter.get("/prices/:id", protectRoute, async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       throw new AppError(400, "INVALID_PRICE_ID", "Price ID is required");
//     }

//     const price = await stripeService.getPrice(id as string);

//     res.json({
//       data: price,
//     });
//   } catch (error) {
//     next(error);
//   }
// });

// stripeRouter.post("/customer", protectRoute, async (req, res, next) => {
//   try {
//     const auth = req.auth;

//     if (!auth?.isAuthenticated) {
//       throw new AppError(401, "UNAUTHORIZED", "User not authenticated");
//     }

//     const clerkUserId = auth.userId;

//     // Check if customer already exists
//     const existingCustomerId =
//       await supabaseService.getStripeCustomerByClerkId(clerkUserId);

//     if (existingCustomerId) {
//       // Return existing customer
//       const customer = await stripeService.getCustomer(existingCustomerId);
//       return res.json({
//         data: customer,
//         created: false,
//       });
//     }

//     // Validate request body
//     const validatedBody = createCustomerSchema.parse(req.body);

//     // Create new Stripe customer
//     const customer = await stripeService.createCustomer({
//       email: validatedBody.email,
//       name: validatedBody.name,
//       metadata: {
//         ...validatedBody.metadata,
//         clerk_user_id: clerkUserId,
//       },
//     });

//     // Store mapping in Supabase
//     await supabaseService.upsertStripeCustomerMapping({
//       user_id: clerkUserId,
//       clerk_user_id: clerkUserId,
//       stripe_customer_id: customer.id,
//     });

//     res.status(201).json({
//       data: customer,
//       created: true,
//     });
//   } catch (error) {
//     next(error);
//   }
// });
