/**
 * @swagger
 * components:
 *   schemas:
 *     ProductCreate:
 *       type: object
 *       required:
 *         - title
 *         - price
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *         image:
 *           type: string
 *         categoryId:
 *           type: string
 *           format: uuid
 *         barcodeTypeId:
 *           type: string
 *           format: cuid
 *           description: ID of the associated barcode type
 *         qty:
 *           type: integer
 *           minimum: 0
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *         addonIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Optional array of addon IDs to associate with the product
 *     Product:
 *       allOf:
 *         - $ref: '#/components/schemas/ProductCreate'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *             category:
 *               $ref: '#/components/schemas/Category'
 *             barcodeType:
 *               $ref: '#/components/schemas/BarcodeType'
 *             addons:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Addon'
 *
 * /api/products/v1:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     description: Creates a new product with optional category, barcode type, addons, and image upload support
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               barcodeTypeId:
 *                 type: string
 *                 format: cuid
 *               image:
 *                 type: string
 *                 format: binary
 *               qty:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               addonIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *
 * /api/products/v1/active:
 *   get:
 *     tags: [Products]
 *     summary: Get all active products
 *     description: Retrieve a list of active products with their categories, addons, pagination and search
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Active products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Active Products retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Product'
 *                           - type: object
 *                             properties:
 *                               addons:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                       format: uuid
 *                                     name:
 *                                       type: string
 *                                     price:
 *                                       type: number
 *                                     unit:
 *                                       type: string
 *                                     stock:
 *                                       type: integer
 *                                     status:
 *                                       type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *
 * /api/products/v1/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     description: Update a product with optional fields. Only provided fields will be updated.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 nullable: true
 *               price:
 *                 type: number
 *                 minimum: 0
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               barcodeTypeId:
 *                 type: string
 *                 format: cuid
 *                 nullable: true
 *               image:
 *                 type: string
 *                 format: binary
 *                 nullable: true
 *               qty:
 *                 type: integer
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               addonIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
