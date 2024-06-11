import { Request, Response, Router } from "express";
import createHttpError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { Product } from "../data-models/entities/product.entity";
import { AppDataSource } from "../db/data-source";
import { onErrorProcessingHttpRequest } from "../helpers/on-error-processing-http-request.helper";

export const productsRouter = Router();
productsRouter.get("/:productId", getById);
productsRouter.get("/", getAll);

/**
 * Get a product by its ID.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getById(req: Request, res: Response): Promise<void> {
  const productId = req.params.productId;

  try {
    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOneBy({
      id: productId,
    });
    if (product === null) {
      throw createHttpError.NotFound(
        `We cannot find a product with ID ${productId}.`
      );
    }

    if (!res.headersSent) {
      res.json({ data: { ...product } });
    }
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving the product.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}

/**
 * Get all products.
 * @param req HTTP request
 * @param res HTTP response
 */
async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const products = await productRepository.find();

    if (!res.headersSent) {
      res.json({ data: products });
    }
  } catch (err) {
    onErrorProcessingHttpRequest(
      err,
      "An error occurred retrieving products.",
      StatusCodes.INTERNAL_SERVER_ERROR,
      res
    );
  }
}
