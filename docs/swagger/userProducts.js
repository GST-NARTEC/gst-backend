/**
 * @swagger
 * components:
 *   schemas:
 *     UserProduct:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Product title
 *         description:
 *           type: string
 *           description: Product description
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           default: ACTIVE
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit
 *         gpc:
 *           type: string
 *           description: Global Product Classification
 *         hsCode:
 *           type: string
 *           description: Harmonized System Code
 *         packagingType:
 *           type: string
 *           description: Type of packaging
 *         unitOfMeasure:
 *           type: string
 *           description: Unit of measure
 *         brandName:
 *           type: string
 *           description: Brand name
 *         countryOfOrigin:
 *           type: string
 *           description: Country where product is manufactured
 *         countryOfSale:
 *           type: string
 *           description: Country where product is sold
 *         productType:
 *           type: string
 *           description: Type of product
 *         isSec:
 *           type: boolean
 *           default: false
 *           description: Is SEC product
 *         barcodeType:
 *           type: string
 *           description: Type of barcode (e.g., EAN-13, UPC-A)
 *
 *     BulkImportRequest:
 *       type: object
 *       required:
 *         - products
 *       properties:
 *         products:
 *           type: array
 *           minItems: 1
 *           maxItems: 1000
 *           items:
 *             $ref: '#/components/schemas/UserProduct'
 *
 *     BulkImportResponse:
 *       type: object
 *       properties:
 *         successful:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               row:
 *                 type: integer
 *                 description: Row number from the import
 *               productId:
 *                 type: string
 *                 description: Created product ID
 *               title:
 *                 type: string
 *               sku:
 *                 type: string
 *               gtin:
 *                 type: string
 *               message:
 *                 type: string
 *         failed:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               row:
 *                 type: integer
 *                 description: Row number from the import
 *               title:
 *                 type: string
 *               sku:
 *                 type: string
 *               error:
 *                 type: string
 *                 description: Error message
 *         summary:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             succeeded:
 *               type: integer
 *             failed:
 *               type: integer
 */

/**
 * @swagger
 * /api/user-products/bulk-import:
 *   post:
 *     summary: Bulk import products
 *     description: Import multiple products at once. Frontend should read Excel and send JSON array. Maximum 1000 products per request.
 *     tags: [User Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkImportRequest'
 *           example:
 *             products:
 *               - title: "Product 1"
 *                 description: "Description for product 1"
 *                 sku: "SKU001"
 *                 barcodeType: "EAN-13"
 *                 brandName: "Brand A"
 *                 status: "ACTIVE"
 *                 gpc: "10000123"
 *                 hsCode: "1234.56"
 *                 packagingType: "Box"
 *                 unitOfMeasure: "EA"
 *                 countryOfOrigin: "US"
 *                 countryOfSale: "SA"
 *                 productType: "Retail"
 *                 isSec: false
 *               - title: "Product 2"
 *                 description: "Description for product 2"
 *                 sku: "SKU002"
 *                 barcodeType: "UPC-A"
 *                 brandName: "Brand B"
 *                 status: "ACTIVE"
 *     responses:
 *       201:
 *         description: All products imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All products imported successfully"
 *                 data:
 *                   $ref: '#/components/schemas/BulkImportResponse'
 *       207:
 *         description: Bulk import completed with some failures
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 207
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Bulk import completed with some failures"
 *                 data:
 *                   $ref: '#/components/schemas/BulkImportResponse'
 *       400:
 *         description: Bad request - validation errors or all products failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "All products failed to import"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

export default {};
